import { useEffect, useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { Plus, X, Pencil } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usersApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api";
import type { User } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { PageLoading, ErrorState, EmptyState } from "@/components/ui/Feedback";

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.list({ page: 1, page_size: 100 });
      setUsers(res.items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      await usersApi.deactivate(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          {t.users.addUser}
        </Button>
      </div>

      {showCreate && (
        <CreateUserPanel
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {editingUser && (
        <EditUserPanel
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={() => {
            setEditingUser(null);
            load();
          }}
        />
      )}

      <Card>
        {isLoading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !users || users.length === 0 ? (
          <EmptyState title={t.users.title} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">{t.users.fullName}</th>
                  <th className="px-5 py-3">{t.users.email}</th>
                  <th className="px-5 py-3">{t.users.role}</th>
                  <th className="px-5 py-3">{t.users.organization}</th>
                  <th className="px-5 py-3">{t.users.status}</th>
                  <th className="px-5 py-3">{t.users.lastLogin}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-paper-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{u.full_name}</td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3 text-slate-600">{t.roles[u.role.name]}</td>
                    <td className="px-5 py-3 text-slate-600">{u.organization ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          u.is_active
                            ? "rounded-full bg-safe-bg px-2.5 py-1 text-xs font-medium text-safe-ink"
                            : "rounded-full bg-paper-100 px-2.5 py-1 text-xs font-medium text-slate-500"
                        }
                      >
                        {u.is_active ? t.users.active : t.users.inactive}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {u.last_login_at ? format(parseISO(u.last_login_at), "PP") : t.users.never}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="flex items-center gap-1 text-xs font-medium text-navy-600 hover:underline"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        {u.is_active && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="text-xs font-medium text-danger-ink hover:underline"
                          >
                            {t.users.deactivate}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function CreateUserPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("analyst");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await usersApi.create({
        full_name: fullName,
        email,
        password,
        role_name: role,
        organization: organization || undefined,
      });
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{t.users.createTitle}</h3>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-paper-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {error && (
          <div className="rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink sm:col-span-2">
            {error}
          </div>
        )}
        <Input label={t.users.fullName} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label={t.users.email} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label={t.users.password}
          type="text"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="≥10 chars, upper+lower+digit+symbol"
        />
        <Select label={t.users.role} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="analyst">{t.roles.analyst}</option>
          <option value="admin">{t.roles.admin}</option>
          <option value="viewer">{t.roles.viewer}</option>
        </Select>
        <Input
          label={t.users.organization}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button type="submit" isLoading={isSubmitting}>
            {t.users.create}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EditUserPanel({
  user,
  onClose,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user.full_name);
  const [organization, setOrganization] = useState(user.organization ?? "");
  const [role, setRole] = useState<"admin" | "analyst" | "viewer">(user.role.name);
  const [isActive, setIsActive] = useState(user.is_active);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await usersApi.update(user.id, {
        full_name: fullName,
        organization: organization || undefined,
        role_name: role,
        is_active: isActive,
      });
      onUpdated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Edit {user.email}</h3>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-paper-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {error && (
          <div className="rounded-md border border-danger-line bg-danger-bg px-3 py-2.5 text-sm text-danger-ink sm:col-span-2">
            {error}
          </div>
        )}
        <Input label={t.users.fullName} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Select label={t.users.role} value={role} onChange={(e) => setRole(e.target.value as "admin" | "analyst" | "viewer")}>
          <option value="analyst">{t.roles.analyst}</option>
          <option value="admin">{t.roles.admin}</option>
          <option value="viewer">{t.roles.viewer}</option>
        </Select>
        <Input
          label={t.users.organization}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="sm:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-line text-navy-700 focus:ring-navy-300"
          />
          {t.users.active}
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" isLoading={isSubmitting}>
            {t.settings.save}
          </Button>
        </div>
      </form>
    </Card>
  );
}
