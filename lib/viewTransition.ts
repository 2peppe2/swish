type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => void;
};

export const runWithViewTransition = (
  update: () => void | Promise<void>,
) => {
  if (typeof document === "undefined") {
    return update();
  }

  const viewTransitionDocument = document as ViewTransitionDocument;

  if (!viewTransitionDocument.startViewTransition) {
    return update();
  }

  return viewTransitionDocument.startViewTransition(update);
};
