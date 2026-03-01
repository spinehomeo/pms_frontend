export interface DoctorEnumOption {
  value: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
}

const toReadableLabel = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getBoolean = (value: unknown, fallback: boolean = true) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (["true", "1", "yes", "active"].includes(normalized)) return true;
    if (["false", "0", "no", "inactive"].includes(normalized)) return false;
  }

  return fallback;
};

const getNumber = (
  value: unknown,
  fallback: number = Number.MAX_SAFE_INTEGER,
) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const parseOptionObject = (
  item: Record<string, unknown>,
): DoctorEnumOption | null => {
  const valueCandidate =
    typeof item.value === "string"
      ? item.value
      : typeof item.code === "string"
        ? item.code
        : typeof item.key === "string"
          ? item.key
          : typeof item.name === "string"
            ? item.name
            : null;

  if (!valueCandidate) {
    return null;
  }

  const labelCandidate =
    typeof item.label === "string"
      ? item.label
      : typeof item.display_name === "string"
        ? item.display_name
        : typeof item.name === "string"
          ? item.name
          : toReadableLabel(valueCandidate);

  const isActiveCandidate =
    item.is_active ?? item.active ?? item.isActive ?? item.status ?? true;

  const sortOrderCandidate =
    item.sort_order ?? item.order ?? item.display_order ?? item.sortOrder;

  return {
    value: valueCandidate,
    label: labelCandidate,
    isActive: getBoolean(isActiveCandidate, true),
    sortOrder: getNumber(sortOrderCandidate),
  };
};

const parseArray = (items: unknown[]): DoctorEnumOption[] => {
  if (items.every((item) => typeof item === "string")) {
    return items.map((item, index) => ({
      value: item,
      label: toReadableLabel(item),
      isActive: true,
      sortOrder: index,
    }));
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      return parseOptionObject(item as Record<string, unknown>);
    })
    .filter((item): item is DoctorEnumOption => item !== null);
};

export const parseDoctorEnumOptions = (data: unknown): DoctorEnumOption[] => {
  let candidates: DoctorEnumOption[] = [];

  if (Array.isArray(data)) {
    candidates = parseArray(data);
  } else if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nestedKeys = [
      "data",
      "items",
      "values",
      "options",
      "results",
      "enum_values",
    ];

    for (const key of nestedKeys) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        candidates = parseArray(nested);
        if (candidates.length > 0) break;
      }
    }
  }

  return candidates
    .filter((item) => item.isActive)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label),
    );
};
