export const randomiseArray = (array: number[]) => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
};

export const wait = (ms: number) =>
  ms === 0 ? undefined : new Promise((resolve) => setTimeout(resolve, ms));

export const voidAsync = (fn: () => Promise<void>) => (): void => void fn();

export const updateArray = <T>(params: {
  currentArray: T[];
  desiredArray: T[];
  equals: (a: T, b: T) => boolean;
  onMatch?: (currentItem: T, desiredItem: T) => T[];
  onNew?: (desiredItem: T) => T[];
  onMissing?: (currentItem: T) => T[];
}): T[] => {
  return [
    // existing items
    ...params.currentArray.flatMap((currentItem) => {
      const desiredItem = params.desiredArray.find((desiredItem) =>
        params.equals(currentItem, desiredItem)
      );

      return desiredItem
        ? params.onMatch?.(currentItem, desiredItem) ?? [desiredItem]
        : params.onMissing?.(currentItem) ?? [];
    }),

    // new items
    ...params.desiredArray
      .filter(
        (desiredItem) =>
          !params.currentArray.some((currentItem) =>
            params.equals(currentItem, desiredItem)
          )
      )
      .flatMap((desiredItem) => params.onNew?.(desiredItem) ?? [desiredItem]),
  ];
};
