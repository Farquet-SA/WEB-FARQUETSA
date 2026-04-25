import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthed, getRole } from "../api/auth";

export default function PrivateRoute({ allowedRoles = [] }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;
    const deny = () => {
      if (mounted) setStatus("denied");
    };

    const verify = async () => {
      if (!isAuthed()) {
        deny();
        return;
      }

      try {
        const role = getRole();

        if (!allowedRoles.includes(role)) {
          deny();
          return;
        }

        if (mounted) setStatus("ok");
      } catch {
        deny();
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [allowedRoles]);

  if (status === "checking") return null;

  return status === "ok" ? <Outlet /> : <Navigate to="/login" replace />;
}
