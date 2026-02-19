import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
      <h1 className="text-6xl font-black text-gradient-primary mb-4">404</h1>
      <p className="text-muted-foreground mb-6">الصفحة غير موجودة</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold"
      >
        العودة للرئيسية
      </button>
    </div>
  );
};

export default NotFound;
