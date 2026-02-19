// ============================================
// ملف: src/components/GameArena.tsx
// الوظيفة: ساحة المعركة الرئيسية مع دعم الفرق والمنطقة الآمنة والسقوط العشوائي
// ============================================

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSquad } from '../context/SquadContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { RealtimeChannel } from '@supabase/supabase-js'
import { ArrowLeft, Users } from 'lucide-react'
import { showPopup, hapticImpact } from '../lib/telegram'

// الثوابت
const MAP_WIDTH = 2000
const MAP_HEIGHT = 2000
const PLAYER_RADIUS = 15
const PLAYER_SPEED = 4
const BULLET_SPEED = 8
const BULLET_SIZE = 6
const BULLET_DAMAGE = 10
const FIRE_RATE = 200 // مللي ثانية بين الطلقات
const GRID_SIZE = 50
const GRID_COLOR = 'rgba(0, 166, 255, 0.2)'
const ZONE_WARN_DISTANCE = 100
const BROADCAST_INTERVAL = 50 // مللي ثانية بين تحديثات البث
const REMOTE_TIMEOUT = 2000 // مللي ثانية بدون تحديث لاعتبار اللاعب منقطعاً
const ZONE_START_RADIUS = 800 // نصف قطر المنطقة الآمنة الابتدائي
const ZONE_SHRINK_RATE = 50 // مقدار الانكماش كل 10 ثوانٍ
const ZONE_SHRINK_INTERVAL = 10000 // 10 ثوانٍ
const ZONE_DAMAGE = 0.5 // الضرر لكل إطار عند الخروج من المنطقة
const MIN_ZONE_RADIUS = 150

interface Vector2 {
  x: number
  y: number
}

interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

interface RemotePlayer {
  userId: string
  username: string
  x: number
  y: number
  targetX: number
  targetY: number
  rotation: number
  health: number
  lastUpdate: number
  team?: 'blue' | 'red' // الفريق
  skin?: string // الشخصية المختارة
}

const GameArena = () => {
  const navigate = useNavigate()
  const { currentSquad, loading } = useSquad()
  const { user, addCoins } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastBroadcastTime = useRef<number>(0)

  // حالة اللاعب المحلي
  const [playerPos, setPlayerPos] = useState<Vector2>({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 })
  const playerVel = useRef<Vector2>({ x: 0, y: 0 })
  const playerRotation = useRef<number>(0)
  const [localHealth, setLocalHealth] = useState(100)
  const [isDead, setIsDead] = useState(false)
  const bullets = useRef<Bullet[]>([])
  const lastShotTime = useRef<number>(0)
  const [kills, setKills] = useState(0) // عدد القتلى لجمع العملات

  // اللاعبون البعيدون
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map())
  const [, forceUpdate] = useState({}) // لإعادة الرسم عند تغيير اللاعبين البعيدين

  // معلومات الفرق
  const [myTeam, setMyTeam] = useState<'blue' | 'red'>('blue')
  const [teams, setTeams] = useState<{ blue: string[]; red: string[] }>({ blue: [], red: [] })

  // المنطقة الآمنة
  const [zoneCenter, setZoneCenter] = useState<Vector2>({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 })
  const [zoneRadius, setZoneRadius] = useState(ZONE_START_RADIUS)

  // التحكمات
  const [joystickActive, setJoystickActive] = useState(false)
  const joystickVector = useRef<Vector2>({ x: 0, y: 0 })
  const [shooting, setShooting] = useState(false)
  const touchStartPos = useRef<Vector2 | null>(null)
  const joystickBasePos = useRef<Vector2>({ x: 100, y: 100 })

  // أبعاد الكانفاس
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // توجيه إذا لم يكن هناك سكواد
  useEffect(() => {
    if (!loading && !currentSquad) {
      navigate('/')
    }
  }, [currentSquad, loading, navigate])

  // إعداد قناة Supabase Realtime واستقبال بداية اللعبة وتوزيع الفرق
  useEffect(() => {
    if (!currentSquad || !user) return

    const channel = supabase.channel(`room_${currentSquad.squad_code}`, {
      config: { broadcast: { self: true } },
    })

    channel
      .on('broadcast', { event: 'player_update' }, ({ payload }) => {
        if (payload.userId === user.id) return
        const remote = remotePlayersRef.current.get(payload.userId)
        const now = Date.now()
        if (remote) {
          remote.targetX = payload.x
          remote.targetY = payload.y
          remote.rotation = payload.rotation
          remote.health = payload.health
          remote.lastUpdate = now
        } else {
          remotePlayersRef.current.set(payload.userId, {
            userId: payload.userId,
            username: payload.username,
            x: payload.x,
            y: payload.y,
            targetX: payload.x,
            targetY: payload.y,
            rotation: payload.rotation,
            health: payload.health,
            lastUpdate: now,
            team: payload.team,
            skin: payload.skin,
          })
        }
        forceUpdate({})
      })
      .on('broadcast', { event: 'player_hit' }, ({ payload }) => {
        const { targetUserId, damage } = payload
        if (targetUserId === user.id) {
          setLocalHealth(prev => {
            const newHealth = Math.max(0, prev - damage)
            if (newHealth <= 0 && !isDead) {
              setIsDead(true)
              channel.send({
                type: 'broadcast',
                event: 'player_died',
                payload: { userId: user.id, killerId: payload.killerId },
              })
            }
            return newHealth
          })
        } else {
          const remote = remotePlayersRef.current.get(targetUserId)
          if (remote) {
            remote.health = Math.max(0, remote.health - damage)
            forceUpdate({})
          }
        }
      })
      .on('broadcast', { event: 'player_died' }, ({ payload }) => {
        const { userId, killerId } = payload
        if (userId === user.id) return // تم التعامل معه محلياً
        const remote = remotePlayersRef.current.get(userId)
        if (remote) {
          remote.health = 0
          forceUpdate({})
        }
        // إذا كان القاتل هو المستخدم المحلي، نضيف عملات
        if (killerId === user.id) {
          addCoins(10)
          setKills(prev => prev + 1)
          hapticImpact('heavy')
        }
      })
      .on('broadcast', { event: 'game_started' }, ({ payload }) => {
        // استقبال معلومات الفرق والمواقع الأولية
        const { teams, spawnPoints } = payload
        setTeams(teams)
        // تحديد فريق اللاعب المحلي
        let playerTeam: 'blue' | 'red' = 'blue'
        if (teams.blue.includes(user.id)) playerTeam = 'blue'
        else if (teams.red.includes(user.id)) playerTeam = 'red'
        setMyTeam(playerTeam)

        // تعيين موقع البداية حسب الفريق
        const spawn = spawnPoints[playerTeam] || { x: MAP_WIDTH/2, y: MAP_HEIGHT/2 }
        setPlayerPos(spawn)
      })
      .on('broadcast', { event: 'zone_update' }, ({ payload }) => {
        setZoneCenter(payload.center)
        setZoneRadius(payload.radius)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [currentSquad, user])

  // توليد مواقع السقوط للفرق (تُستدعى من قبل القائد عند بدء اللعبة)
  const generateSpawnPoints = () => {
    // نقطة للفريق الأزرق في الجزء العلوي الأيسر
    const blueSpawn = {
      x: Math.random() * (MAP_WIDTH / 2 - 200) + 100,
      y: Math.random() * (MAP_HEIGHT / 2 - 200) + 100,
    }
    // نقطة للفريق الأحمر في الجزء السفلي الأيمن
    const redSpawn = {
      x: Math.random() * (MAP_WIDTH / 2 - 200) + MAP_WIDTH / 2,
      y: Math.random() * (MAP_HEIGHT / 2 - 200) + MAP_HEIGHT / 2,
    }
    return { blue: blueSpawn, red: redSpawn }
  }

  // دالة لبدء اللعبة من قبل القائد (تعديل على startGame في SquadContext)
  // سنقوم بتعديل startGame في SquadContext لترسل هذه المعلومات
  // لكننا هنا سنفترض أن القائد أرسل game_started مع spawnPoints

  // تحديث حجم الكانفاس
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width, height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // حلقة اللعبة الرئيسية
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (timestamp: number) => {
      if (isDead) {
        render(ctx)
        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // تحديث حركة اللاعب المحلي من الجويستيك
      if (joystickActive) {
        const joy = joystickVector.current
        const len = Math.hypot(joy.x, joy.y)
        if (len > 0) {
          const normX = joy.x / len
          const normY = joy.y / len
          playerVel.current.x = normX * PLAYER_SPEED
          playerVel.current.y = normY * PLAYER_SPEED
          playerRotation.current = Math.atan2(normY, normX)
        }
      } else {
        playerVel.current.x *= 0.95
        playerVel.current.y *= 0.95
        if (Math.abs(playerVel.current.x) < 0.1) playerVel.current.x = 0
        if (Math.abs(playerVel.current.y) < 0.1) playerVel.current.y = 0
      }

      // تحديث موقع اللاعب المحلي
      setPlayerPos(prev => {
        let newX = prev.x + playerVel.current.x
        let newY = prev.y + playerVel.current.y
        newX = Math.max(PLAYER_RADIUS, Math.min(MAP_WIDTH - PLAYER_RADIUS, newX))
        newY = Math.max(PLAYER_RADIUS, Math.min(MAP_HEIGHT - PLAYER_RADIUS, newY))
        return { x: newX, y: newY }
      })

      // إطلاق النار
      if (shooting) {
        const now = timestamp
        if (now - lastShotTime.current > FIRE_RATE) {
          lastShotTime.current = now
          const angle = playerRotation.current
          const dirX = Math.cos(angle)
          const dirY = Math.sin(angle)
          bullets.current.push({
            x: playerPos.x + dirX * (PLAYER_RADIUS + 2),
            y: playerPos.y + dirY * (PLAYER_RADIUS + 2),
            vx: dirX * BULLET_SPEED,
            vy: dirY * BULLET_SPEED,
            life: 1,
          })
          hapticImpact('light')
        }
      }

      // تحديث الرصاصات وفحص التصادم مع اللاعبين البعيدين
      bullets.current = bullets.current
        .map(b => {
          b.x += b.vx
          b.y += b.vy
          b.life -= 0.01

          for (const [id, remote] of remotePlayersRef.current.entries()) {
            if (remote.health <= 0) continue
            // لا تؤذي زملاء الفريق
            if (remote.team === myTeam) continue
            const dx = b.x - remote.x
            const dy = b.y - remote.y
            const dist = Math.hypot(dx, dy)
            if (dist < PLAYER_RADIUS + BULLET_SIZE / 2) {
              remote.health -= BULLET_DAMAGE
              channelRef.current?.send({
                type: 'broadcast',
                event: 'player_hit',
                payload: { targetUserId: id, damage: BULLET_DAMAGE, killerId: user?.id },
              })
              if (remote.health <= 0) {
                channelRef.current?.send({
                  type: 'broadcast',
                  event: 'player_died',
                  payload: { userId: id, killerId: user?.id },
                })
              }
              return null
            }
          }
          return b
        })
        .filter(b => b !== null && b.life > 0 && b.x >= 0 && b.x <= MAP_WIDTH && b.y >= 0 && b.y <= MAP_HEIGHT) as Bullet[]

      // استيفاء حركة اللاعبين البعيدين
      const now = Date.now()
      remotePlayersRef.current.forEach((remote, id) => {
        remote.x += (remote.targetX - remote.x) * 0.1
        remote.y += (remote.targetY - remote.y) * 0.1
        if (now - remote.lastUpdate > REMOTE_TIMEOUT) {
          remotePlayersRef.current.delete(id)
        }
      })

      // تأثير المنطقة الآمنة: ضرر إذا كان خارجها
      const distFromCenter = Math.hypot(playerPos.x - zoneCenter.x, playerPos.y - zoneCenter.y)
      if (distFromCenter > zoneRadius) {
        setLocalHealth(prev => Math.max(0, prev - ZONE_DAMAGE))
      }

      // بث حالة اللاعب المحلي
      if (timestamp - lastBroadcastTime.current > BROADCAST_INTERVAL) {
        lastBroadcastTime.current = timestamp
        channelRef.current?.send({
          type: 'broadcast',
          event: 'player_update',
          payload: {
            userId: user?.id,
            username: user?.username,
            x: playerPos.x,
            y: playerPos.y,
            rotation: playerRotation.current,
            health: localHealth,
            team: myTeam,
            skin: user?.selectedSkin,
          },
        })
      }

      render(ctx)
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [joystickActive, shooting, playerPos, localHealth, isDead, user, myTeam, zoneCenter, zoneRadius])

  // دورة تقلص المنطقة (يتم تشغيلها مرة واحدة عند بدء اللعبة)
  useEffect(() => {
    if (!currentSquad || currentSquad.status !== 'in-game') return

    const interval = setInterval(() => {
      setZoneRadius(prev => {
        const newRadius = Math.max(MIN_ZONE_RADIUS, prev - ZONE_SHRINK_RATE)
        // بث تحديث المنطقة لجميع اللاعبين
        channelRef.current?.send({
          type: 'broadcast',
          event: 'zone_update',
          payload: { center: zoneCenter, radius: newRadius },
        })
        return newRadius
      })
    }, ZONE_SHRINK_INTERVAL)

    return () => clearInterval(interval)
  }, [currentSquad, zoneCenter])

  // دالة الرسم
  const render = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize
    if (width === 0 || height === 0) return

    ctx.clearRect(0, 0, width, height)

    // خلفية داكنة
    ctx.fillStyle = '#0b1120'
    ctx.fillRect(0, 0, width, height)

    // رسم الشبكة المتحركة
    const halfW = width / 2
    const halfH = height / 2
    const offsetX = playerPos.x % GRID_SIZE
    const offsetY = playerPos.y % GRID_SIZE

    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = 1

    for (let x = offsetX; x < width; x += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let x = -GRID_SIZE + offsetX; x > 0; x -= GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = offsetY; y < height; y += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    for (let y = -GRID_SIZE + offsetY; y > 0; y -= GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // رسم المنطقة الآمنة (دائرة خضراء شفافة)
    const zoneScreenX = zoneCenter.x - playerPos.x + halfW
    const zoneScreenY = zoneCenter.y - playerPos.y + halfH
    ctx.beginPath()
    ctx.arc(zoneScreenX, zoneScreenY, zoneRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.stroke()
    ctx.setLineDash([])

    // رسم الرصاصات
    bullets.current.forEach(b => {
      const screenX = b.x - playerPos.x + halfW
      const screenY = b.y - playerPos.y + halfH
      if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) return

      ctx.beginPath()
      ctx.arc(screenX, screenY, BULLET_SIZE, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 100, ${b.life})`
      ctx.shadowColor = '#ffff00'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // رسم اللاعبين البعيدين
    remotePlayersRef.current.forEach(remote => {
      const screenX = remote.x - playerPos.x + halfW
      const screenY = remote.y - playerPos.y + halfH
      if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) return

      // تحديد لون الجسم حسب الفريق
      let bodyColor = '#ff4d4d' // أحمر للأعداء (افتراضي)
      if (remote.team === 'blue') bodyColor = '#4d4dff' // أزرق للفريق الأزرق
      else if (remote.team === 'red') bodyColor = '#ff4d4d' // أحمر للفريق الأحمر

      // إذا كان زميلاً (نفس الفريق) نضيف هالة خضراء
      const isTeammate = remote.team === myTeam

      // رسم الهالة الخضراء للزميل
      if (isTeammate && remote.health > 0) {
        ctx.beginPath()
        ctx.arc(screenX, screenY, PLAYER_RADIUS + 5, 0, Math.PI * 2)
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.shadowColor = '#00ff00'
        ctx.shadowBlur = 15
        ctx.stroke()
      }

      // جسم اللاعب
      ctx.beginPath()
      ctx.arc(screenX, screenY, PLAYER_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = remote.health > 0 ? bodyColor : '#666'
      ctx.shadowColor = remote.health > 0 ? (remote.team === 'blue' ? '#0000ff' : '#ff0000') : '#444'
      ctx.shadowBlur = 15
      ctx.fill()

      // مؤشر الاتجاه
      const tipX = screenX + Math.cos(remote.rotation) * (PLAYER_RADIUS + 5)
      const tipY = screenY + Math.sin(remote.rotation) * (PLAYER_RADIUS + 5)
      const leftX = screenX + Math.cos(remote.rotation + 2.2) * (PLAYER_RADIUS - 2)
      const leftY = screenY + Math.sin(remote.rotation + 2.2) * (PLAYER_RADIUS - 2)
      const rightX = screenX + Math.cos(remote.rotation - 2.2) * (PLAYER_RADIUS - 2)
      const rightY = screenY + Math.sin(remote.rotation - 2.2) * (PLAYER_RADIUS - 2)

      ctx.beginPath()
      ctx.moveTo(tipX, tipY)
      ctx.lineTo(leftX, leftY)
      ctx.lineTo(rightX, rightY)
      ctx.closePath()
      ctx.fillStyle = 'white'
      ctx.shadowBlur = 10
      ctx.fill()

      // شريط الحياة
      const barWidth = PLAYER_RADIUS * 2
      const barHeight = 4
      const barX = screenX - barWidth / 2
      const barY = screenY - PLAYER_RADIUS - 10
      ctx.shadowBlur = 0
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      ctx.fillStyle = remote.health > 50 ? '#0f0' : remote.health > 20 ? '#ff0' : '#f00'
      ctx.fillRect(barX, barY, barWidth * (remote.health / 100), barHeight)

      // اسم المستخدم
      ctx.font = 'bold 12px monospace'
      ctx.fillStyle = '#fff'
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 4
      ctx.fillText(remote.username, barX, barY - 5)
      ctx.shadowBlur = 0
    })

    // رسم اللاعب المحلي
    const playerScreenX = halfW
    const playerScreenY = halfH

    // هالة خضراء للاعب المحلي (حيث أنه زميل نفسه)
    ctx.beginPath()
    ctx.arc(playerScreenX, playerScreenY, PLAYER_RADIUS + 5, 0, Math.PI * 2)
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.shadowColor = '#00ff00'
    ctx.shadowBlur = 15
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(playerScreenX, playerScreenY, PLAYER_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = myTeam === 'blue' ? '#4d4dff' : '#ff4d4d'
    ctx.shadowColor = myTeam === 'blue' ? '#0000ff' : '#ff0000'
    ctx.shadowBlur = 20
    ctx.fill()

    const tipX = playerScreenX + Math.cos(playerRotation.current) * (PLAYER_RADIUS + 5)
    const tipY = playerScreenY + Math.sin(playerRotation.current) * (PLAYER_RADIUS + 5)
    const leftX = playerScreenX + Math.cos(playerRotation.current + 2.2) * (PLAYER_RADIUS - 2)
    const leftY = playerScreenY + Math.sin(playerRotation.current + 2.2) * (PLAYER_RADIUS - 2)
    const rightX = playerScreenX + Math.cos(playerRotation.current - 2.2) * (PLAYER_RADIUS - 2)
    const rightY = playerScreenY + Math.sin(playerRotation.current - 2.2) * (PLAYER_RADIUS - 2)

    ctx.beginPath()
    ctx.moveTo(tipX, tipY)
    ctx.lineTo(leftX, leftY)
    ctx.lineTo(rightX, rightY)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.shadowBlur = 10
    ctx.fill()

    // شريط حياة اللاعب المحلي
    const barWidth = PLAYER_RADIUS * 2
    const barHeight = 4
    const barX = playerScreenX - barWidth / 2
    const barY = playerScreenY - PLAYER_RADIUS - 10
    ctx.shadowBlur = 0
    ctx.fillStyle = '#333'
    ctx.fillRect(barX, barY, barWidth, barHeight)
    ctx.fillStyle = localHealth > 50 ? '#0f0' : localHealth > 20 ? '#ff0' : '#f00'
    ctx.fillRect(barX, barY, barWidth * (localHealth / 100), barHeight)

    ctx.font = 'bold 12px monospace'
    ctx.fillStyle = '#fff'
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 4
    ctx.fillText(user?.username || 'You', barX, barY - 5)
    ctx.shadowBlur = 0

    // عرض عدد القتلى
    ctx.font = 'bold 16px monospace'
    ctx.fillStyle = '#fff'
    ctx.fillText(`قتلى: ${kills}`, 10, 30)

    // جدران المنطقة (تحذير عند الاقتراب من حافة الخريطة)
    const nearLeft = playerPos.x - PLAYER_RADIUS < ZONE_WARN_DISTANCE
    const nearRight = MAP_WIDTH - playerPos.x - PLAYER_RADIUS < ZONE_WARN_DISTANCE
    const nearTop = playerPos.y - PLAYER_RADIUS < ZONE_WARN_DISTANCE
    const nearBottom = MAP_HEIGHT - playerPos.y - PLAYER_RADIUS < ZONE_WARN_DISTANCE

    ctx.shadowColor = '#ff3b3b'
    ctx.shadowBlur = 20
    ctx.lineWidth = 4
    ctx.strokeStyle = '#ff3b3b'

    if (nearLeft) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, height)
      ctx.stroke()
    }
    if (nearRight) {
      ctx.beginPath()
      ctx.moveTo(width, 0)
      ctx.lineTo(width, height)
      ctx.stroke()
    }
    if (nearTop) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.stroke()
    }
    if (nearBottom) {
      ctx.beginPath()
      ctx.moveTo(0, height)
      ctx.lineTo(width, height)
      ctx.stroke()
    }
    ctx.shadowBlur = 0

    // تراكب الموت
    if (isDead) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = 'bold 32px monospace'
      ctx.fillStyle = '#ff3b3b'
      ctx.shadowColor = '#ff0000'
      ctx.shadowBlur = 20
      ctx.fillText('ELIMINATED', width/2-140, height/2)
      ctx.shadowBlur = 0
      
      // زر العودة (يمكن إضافته كـ UI منفصل)
    }
  }

  // معالجة اللمس (كما هي)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (isDead) return
    const touch = e.touches[0]
    if (!touch) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (x < rect.width / 2) {
      setJoystickActive(true)
      touchStartPos.current = { x, y }
      joystickBasePos.current = { x, y }
      joystickVector.current = { x: 0, y: 0 }
    } else {
      setShooting(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (isDead || !joystickActive || !touchStartPos.current) return
    const touch = e.touches[0]
    if (!touch) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const dx = x - joystickBasePos.current.x
    const dy = y - joystickBasePos.current.y
    const distance = Math.hypot(dx, dy)
    const maxDistance = 50
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx)
      joystickVector.current = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      }
    } else {
      joystickVector.current = {
        x: dx / maxDistance,
        y: dy / maxDistance,
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setJoystickActive(false)
    setShooting(false)
    joystickVector.current = { x: 0, y: 0 }
    touchStartPos.current = null
  }

  // إذا مات جميع أفراد الفريق الآخر، يمكن إنهاء اللعبة وإضافة عملات للفريق الفائز
  // هذا الجزء يمكن إضافته لاحقاً.

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-slate-950 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <button
        onClick={() => {
          // العودة إلى اللوبي أو الصفحة الرئيسية
          if (isDead) {
            navigate('/')
          } else {
            if (window.confirm('هل تريد مغادرة اللعبة؟')) {
              navigate('/')
            }
          }
        }}
        className="absolute top-4 left-4 z-10 bg-slate-900/80 p-2 rounded-full border border-white/10 text-white"
      >
        <ArrowLeft size={24} />
      </button>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}

export default GameArena