import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthed, getRole } from "../api/auth";

export default function PrivateRoute({ allowedRoles = [] }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (!isAuthed()) {
        if (mounted) setStatus("denied");
        return;
      }

      try {
        const role = getRole()
          
        if (!allowedRoles.includes(role)) {
          setStatus("denied");;
          if (mounted) setStatus("denied");
          return;
        }

        if (mounted) setStatus("ok");
      } catch {
        setStatus("denied");;
        if (mounted) setStatus("denied");
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