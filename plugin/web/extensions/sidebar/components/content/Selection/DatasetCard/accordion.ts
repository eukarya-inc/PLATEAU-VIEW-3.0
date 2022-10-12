export function collapseSection(element: HTMLDivElement | null) {
  if (!element) return;
  const sectionHeight = element.scrollHeight;

  const elementTransition = element.style.transition;
  element.style.transition = "";

  requestAnimationFrame(function () {
    element.style.height = sectionHeight + "px";
    element.style.transition = elementTransition;

    requestAnimationFrame(function () {
      element.style.height = 0 + "px";
      element.style.paddingTop = "0";
      element.style.paddingBottom = "0";
    });
  });

  element.setAttribute("data-collapsed", "true");
}

export function expandSection(element: HTMLDivElement | null) {
  if (!element) return;

  const sectionHeight = element.scrollHeight + 24;

  element.style.height = sectionHeight + "px";
  element.style.paddingTop = "12px";
  element.style.paddingBottom = "12px";

  element.addEventListener("transitionend", function () {
    element.removeEventListener("transitionend", arguments.callee as any);
    element.style.height = null as any;
  });

  element.setAttribute("data-collapsed", "false");
}
