// ============================================
// Admin Dashboard - Kilegram
// ============================================

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Megaphone, Ban, Gift, Shield, Activity, Search } from 'lucide-react';
import { getLevelTitle } from '@/lib/xpSystem';

interface PlayerProfile {
  id: string;
  user_id: string;
  username: string;
  level: number;
  xp: number;
  k_coins: number;
  k_gems: number;
  total_kills: number;
  total_wins: number;
  total_matches: number;
  is_banned: boolean;
  created_at: string;
}

interface GameEvent {
  id: string;
  title: string;
  content: string;
  event_type: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'players' | 'events' | 'stats'>('players');
  const [newEvent, setNewEvent] = useState({ title: '', content: '', event_type: 'news' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/'); return; }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some(r => r.role === 'admin')) { navigate('/'); return; }
    setIsAdmin(true);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    const [profilesRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('game_events').select('*').order('created_at', { ascending: false }),
    ]);
    if (profilesRes.data) setPlayers(profilesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    await supabase.from('profiles').update({ is_banned: !currentlyBanned }).eq('user_id', userId);
    loadData();
  };

  const grantCoins = async (userId: string, amount: number) => {
    const player = players.find(p => p.user_id === userId);
    if (!player) return;
    await supabase.from('profiles').update({ k_coins: player.k_coins + amount }).eq('user_id', userId);
    loadData();
  };

  const publishEvent = async () => {
    if (!newEvent.title || !newEvent.content) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('game_events').insert({
      title: newEvent.title,
      content: newEvent.content,
      event_type: newEvent.event_type,
      created_by: user?.id,
    });
    setNewEvent({ title: '', content: '', event_type: 'news' });
    loadData();
  };

  const toggleEventActive = async (eventId: string, isActive: boolean) => {
    await supabase.from('game_events').update({ is_active: !isActive }).eq('id', eventId);
    loadData();
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse text-lg">جاري التحقق من الصلاحيات...</div>
      </div>
    );
  }

  const filteredPlayers = searchQuery
    ? players.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : players;

  const totalPlayers = players.length;
  const bannedPlayers = players.filter(p => p.is_banned).length;
  const totalKills = players.reduce((sum, p) => sum + p.total_kills, 0);
  const totalMatches = players.reduce((sum, p) => sum + p.total_matches, 0);

  const levelBuckets = [
    { label: '1-5', min: 1, max: 5 },
    { label: '6-10', min: 6, max: 10 },
    { label: '11-20', min: 11, max: 20 },
    { label: '21-30', min: 21, max: 30 },
    { label: '31+', min: 31, max: 999 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <Shield className="text-primary" size={24} />
        <h1 className="text-xl font-bold text-primary">لوحة تحكم الأدمن</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { icon: <Users size={20} className="text-primary" />, value: totalPlayers, label: 'إجمالي اللاعبين', accent: 'border-primary/20' },
          { icon: <Ban size={20} className="text-accent" />, value: bannedPlayers, label: 'محظورون', accent: 'border-accent/20' },
          { icon: <Activity size={20} className="text-gold" />, value: totalMatches, label: 'مباريات', accent: 'border-gold/20' },
          { icon: <span className="text-accent">💀</span>, value: totalKills, label: 'إجمالي القتلى', accent: 'border-accent/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-card rounded-xl p-4 border ${stat.accent}`}>
            <div className="mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 bg-card mx-4 rounded-xl p-1 border border-border">
        {(['players', 'events', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'players' ? 'اللاعبون' : tab === 'events' ? 'الأحداث' : 'إحصائيات'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {activeTab === 'players' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث عن لاعب..."
                className="w-full bg-card rounded-lg py-2.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground border border-border focus:border-primary/40 focus:outline-none transition"
              />
            </div>

            {filteredPlayers.map(player => (
              <div key={player.id} className={`bg-card rounded-xl p-4 border transition-all ${player.is_banned ? 'border-accent/40' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-foreground">{player.username}</span>
                    <span className="text-xs text-primary ml-2">Lv.{player.level}</span>
                    <span className="text-xs text-muted-foreground ml-1">({getLevelTitle(player.level)})</span>
                    {player.is_banned && <span className="text-xs text-accent ml-2">🚫 محظور</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💰 {player.k_coins} | 💎 {player.k_gems}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  ⚔️ {player.total_kills} قتلى | 🏆 {player.total_wins} فوز | 🎮 {player.total_matches} مباراة
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBan(player.user_id, player.is_banned)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      player.is_banned ? 'bg-neon-green/20 text-neon-green' : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {player.is_banned ? 'إلغاء الحظر' : 'حظر'}
                  </button>
                  <button
                    onClick={() => grantCoins(player.user_id, 100)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-gold/20 text-gold transition hover:bg-gold/30"
                  >
                    <Gift size={12} className="inline mr-1" />
                    +100 عملة
                  </button>
                </div>
              </div>
            ))}
            {filteredPlayers.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">لا يوجد لاعبون مطابقون</p>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* New Event Form */}
            <div className="bg-card rounded-xl p-4 border border-primary/20">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                <Megaphone size={16} />
                نشر حدث جديد
              </h3>
              <input
                value={newEvent.title}
                onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان الحدث"
                className="w-full bg-secondary rounded-lg p-2.5 mb-2 text-sm text-foreground placeholder-muted-foreground border border-border focus:border-primary/40 focus:outline-none"
              />
              <textarea
                value={newEvent.content}
                onChange={e => setNewEvent(prev => ({ ...prev, content: e.target.value }))}
                placeholder="محتوى الحدث"
                rows={3}
                className="w-full bg-secondary rounded-lg p-2.5 mb-2 text-sm text-foreground placeholder-muted-foreground border border-border focus:border-primary/40 focus:outline-none resize-none"
              />
              <select
                value={newEvent.event_type}
                onChange={e => setNewEvent(prev => ({ ...prev, event_type: e.target.value }))}
                className="w-full bg-secondary rounded-lg p-2.5 mb-3 text-sm text-foreground border border-border"
              >
                <option value="news">📰 خبر</option>
                <option value="update">🔄 تحديث</option>
                <option value="event">🎉 فعالية</option>
                <option value="maintenance">🔧 صيانة</option>
              </select>
              <button
                onClick={publishEvent}
                className="w-full py-2.5 gradient-primary text-primary-foreground rounded-lg font-semibold shadow-neon"
              >
                نشر الحدث
              </button>
            </div>

            {events.map(event => (
              <div key={event.id} className={`bg-card rounded-xl p-4 border ${event.is_active ? 'border-neon-green/20' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-foreground">{event.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${event.is_active ? 'bg-neon-green/20 text-neon-green' : 'bg-muted text-muted-foreground'}`}>
                    {event.is_active ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{event.content}</p>
                <button
                  onClick={() => toggleEventActive(event.id, event.is_active)}
                  className="text-xs text-primary hover:underline"
                >
                  {event.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3">توزيع المستويات</h3>
              <div className="space-y-2">
                {levelBuckets.map(bucket => {
                  const count = players.filter(p => p.level >= bucket.min && p.level <= bucket.max).length;
                  const pct = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
                  return (
                    <div key={bucket.label} className="flex items-center gap-2">
                      <span className="text-xs w-12 text-muted-foreground">{bucket.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-bold text-foreground mb-3">أعلى 5 لاعبين</h3>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.total_kills - a.total_kills)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}{' '}
                        {p.username}
                        <span className="text-xs text-muted-foreground ml-1">Lv.{p.level}</span>
                      </span>
                      <span className="text-muted-foreground">💀 {p.total_kills}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
