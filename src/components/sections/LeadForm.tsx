import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/data/api";
import type { LeadRole } from "@/data/types";
import { cn } from "@/lib/utils";

const PHONE_RE = /^\+?[\d\s()-]{7,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "success" | "success_mailto";

export function LeadForm() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<LeadRole>("kandydat");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<{ name?: string; contact?: string; send?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = t("form.err_name");
    const c = contact.trim();
    if (!c) e.contact = t("form.err_contact");
    else if (!PHONE_RE.test(c) && !EMAIL_RE.test(c)) e.contact = t("form.err_contact_format");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    const res = await submitLead({ name: name.trim(), contact: contact.trim(), role, lang: i18n.resolvedLanguage ?? "pl" });
    if (res.ok) {
      setStatus(res.mode === "mailto" ? "success_mailto" : "success");
      setName("");
      setContact("");
    } else {
      setStatus("idle");
      setErrors({ send: t("form.err_send") });
    }
  };

  const roleBtn = (value: LeadRole, label: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      aria-pressed={role === value}
      className={cn(
        "p-[14px] rounded-[14px] border-[1.5px] font-bold text-[14px] cursor-pointer transition-colors",
        role === value ? "border-navy bg-navy text-ground" : "border-navy/18 bg-transparent text-navy hover:border-navy",
      )}
    >
      {label}
    </button>
  );

  return (
    <section id="zgloszenie" className="container-site pb-20">
      <div className="bg-lime rounded-[32px] p-[clamp(32px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-[clamp(24px,4vw,64px)] gap-y-8 items-center">
        <div>
          <h2 className="font-display font-extrabold text-[clamp(32px,4.2vw,56px)] tracking-[-0.03em] leading-[1.02]">{t("form.title")}</h2>
          <p className="text-[17px] leading-[1.6] mt-[18px] text-lime-deep max-w-[44ch]">{t("form.lead")}</p>
        </div>

        {status === "success" || status === "success_mailto" ? (
          <div className="bg-ground rounded-[20px] p-7 grid gap-3" role="status">
            <CheckCircle2 size={36} className="text-dot" />
            <strong className="font-display text-[22px] tracking-[-0.02em]">{t("form.success_title")}</strong>
            <p className="text-[15px] text-ink-2">{t(status === "success_mailto" ? "form.success_mailto" : "form.success_text")}</p>
            <button type="button" onClick={() => setStatus("idle")} className="text-[14px] font-bold text-lime-text text-left cursor-pointer hover:text-navy">
              {t("form.again")}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="grid gap-3">
            <div>
              <Input
                name="name"
                autoComplete="name"
                placeholder={t("form.name")}
                aria-label={t("form.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-[13px] font-semibold text-red-700 mt-1 px-1">{errors.name}</p>}
            </div>
            <div>
              <Input
                name="contact"
                placeholder={t("form.contact")}
                aria-label={t("form.contact")}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={!!errors.contact}
              />
              {errors.contact && <p className="text-[13px] font-semibold text-red-700 mt-1 px-1">{errors.contact}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {roleBtn("kandydat", t("form.role_candidate"))}
              {roleBtn("pracodawca", t("form.role_employer"))}
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="p-[18px] rounded-[14px] bg-navy text-ground font-bold text-[15px] cursor-pointer transition-colors hover:bg-navy-hover disabled:opacity-70"
            >
              {status === "sending" ? t("form.sending") : t("form.submit")}
            </button>
            {errors.send && <p className="text-[13px] font-semibold text-red-700 px-1" role="alert">{errors.send}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
