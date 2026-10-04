import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import "./modal-accessibility.css";

type ModalProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  closeDisabled?: boolean;
};

const focusableSelector = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "summary",
  '[contenteditable="true"]',
  "[tabindex]",
].join(",");

function getFocusable(dialog: HTMLElement) {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      !element.closest('[inert], [aria-hidden="true"]') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden",
  );
}

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  closeDisabled = false,
}: ModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef(
    typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const callbacks = useRef({ onClose, closeDisabled });
  callbacks.current = { onClose, closeDisabled };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (
      document.activeElement instanceof HTMLElement &&
      dialog.contains(document.activeElement)
    ) {
      initialFocusRef.current = document.activeElement;
    }

    const focusFirst = () => {
      const autofocus =
        dialog.querySelector<HTMLElement>("[autofocus], [data-autofocus]") ??
        initialFocusRef.current;
      const focusable = getFocusable(dialog);
      const target =
        autofocus && focusable.includes(autofocus)
          ? autofocus
          : (focusable[0] ?? dialog);
      target.focus({ preventScroll: true });
    };

    // React's autoFocus runs before this effect; preserve that field's focus.
    if (!dialog.contains(document.activeElement)) focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!callbacks.current.closeDisabled) callbacks.current.onClose();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        const focusable = getFocusable(dialog);
        const index = focusable.indexOf(document.activeElement as HTMLElement);
        const nextIndex = event.shiftKey
          ? index <= 0
            ? focusable.length - 1
            : index - 1
          : index < 0 || index === focusable.length - 1
            ? 0
            : index + 1;
        (focusable[nextIndex] ?? dialog).focus({ preventScroll: true });
        return;
      }

      // Recover if a background control is focused programmatically.
      if (!dialog.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        focusFirst();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) focusFirst();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.body.style.overflow = previousOverflow;
      const isAvailable = (
        element: HTMLElement | null,
      ): element is HTMLElement =>
        !!element?.isConnected &&
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility !== "hidden" &&
        !element.matches(":disabled") &&
        !element.closest("[inert]");
      const restoreTarget = isAvailable(triggerRef.current)
        ? triggerRef.current
        : Array.from(
            document.querySelectorAll<HTMLElement>(
              "[data-dialog-focus-fallback]",
            ),
          ).find(isAvailable);
      restoreTarget?.focus({ preventScroll: true });
    };
  }, []);

  const close = () => {
    if (!callbacks.current.closeDisabled) callbacks.current.onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
    >
      <section
        ref={dialogRef}
        className="modal accessible-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p id={subtitleId}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-button"
            title="Close dialog"
            aria-label="Close dialog"
            disabled={closeDisabled}
            onClick={close}
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
