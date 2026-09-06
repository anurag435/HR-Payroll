import { useEffect, useRef, useState } from "react";

// Shared by every dropdown/popover in the app (nav menus, profile menu,
// attendance widget) so they all close consistently on outside click or
// Escape, instead of each one reimplementing (or forgetting) that logic.
export default function useDismissableDropdown(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return [open, setOpen, ref];
}
