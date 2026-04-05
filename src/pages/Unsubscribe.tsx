import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && <p className="text-muted-foreground">Verificando...</p>}
        {status === "valid" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Cancelar inscrição</h1>
            <p className="text-muted-foreground">Deseja parar de receber nossos e-mails?</p>
            <button
              onClick={handleUnsubscribe}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Confirmar cancelamento
            </button>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Inscrição cancelada ✅</h1>
            <p className="text-muted-foreground">Você não receberá mais nossos e-mails.</p>
          </>
        )}
        {status === "already" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Já cancelado</h1>
            <p className="text-muted-foreground">Sua inscrição já foi cancelada anteriormente.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Link inválido</h1>
            <p className="text-muted-foreground">Este link de cancelamento é inválido ou expirou.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Erro</h1>
            <p className="text-muted-foreground">Ocorreu um erro. Tente novamente mais tarde.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
