import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EmployerFlow } from "@/components/employer/EmployerFlow";
import { EmployerPanel, ModerationPanel } from "@/components/employer/EmployerPanel";
import { useAuth } from "@/lib/auth";

/**
 * Jedno miejsce, z którego dowolny element strony otwiera okna pracodawcy.
 * Dzięki temu przycisk w sekcji ofert i pozycja w menu nie muszą nic o sobie wiedzieć.
 */
interface Panele {
  otworzKreator: () => void;
  otworzProfil: () => void;
  otworzModeracje: () => void;
}

const Ctx = createContext<Panele | null>(null);

export function PanelsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [kreator, setKreator] = useState(false);
  const [profil, setProfil] = useState(false);
  const [moderacja, setModeracja] = useState(false);

  const wartosc = useMemo<Panele>(
    () => ({
      otworzKreator: () => setKreator(true),
      otworzProfil: () => setProfil(true),
      otworzModeracje: () => setModeracja(true),
    }),
    [],
  );

  return (
    <Ctx.Provider value={wartosc}>
      {children}
      <EmployerFlow otwarte={kreator} zamknij={() => setKreator(false)} />
      {auth.zalogowany && <EmployerPanel otwarte={profil} zamknij={() => setProfil(false)} />}
      {auth.moderator && <ModerationPanel otwarte={moderacja} zamknij={() => setModeracja(false)} />}
    </Ctx.Provider>
  );
}

export function usePanels() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePanels musi być użyte wewnątrz <PanelsProvider>");
  return c;
}
