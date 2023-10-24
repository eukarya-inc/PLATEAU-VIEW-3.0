import { styled, List, ListItemButton } from "@mui/material";
import { useCallback, useState, useMemo, useEffect } from "react";

type ComponentSelectorProps = {
  tree: { label: string; value: string; children: { label: string; value: string }[] }[];
  onComponentSelect?: (type: string) => void;
  onComponentDoubleClick?: () => void;
};

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  tree,
  onComponentSelect,
  onComponentDoubleClick,
}) => {
  const [selectedCategory, selectCategory] = useState(tree[0]?.value);
  const [selectedField, selectField] = useState<string>();

  const handleCategoryClick = useCallback((category: string) => {
    selectCategory(category);
  }, []);

  const handleFieldClick = useCallback((field: string) => {
    selectField(field);
  }, []);

  const fields = useMemo(
    () => tree.find(c => c.value === selectedCategory)?.children,
    [tree, selectedCategory],
  );

  useEffect(() => {
    if (!selectedField) return;
    onComponentSelect?.(selectedField);
  }, [selectedField, onComponentSelect]);

  return (
    <Wrapper>
      <StyledMenuList>
        {tree.map(category => (
          <StyledListItemButton
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            selected={category.value === selectedCategory}>
            {category.label}
          </StyledListItemButton>
        ))}
      </StyledMenuList>
      <StyledList>
        {fields?.map(field => (
          <StyledListItemButton
            key={field.value}
            onClick={() => handleFieldClick(field.value)}
            onDoubleClick={onComponentDoubleClick}
            selected={field.value === selectedField}>
            {field.label}
          </StyledListItemButton>
        ))}
      </StyledList>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(0.5),
  flex: 2,
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}));

const StyledMenuList = styled(StyledList)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  flex: 1,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
  fontSize: theme.typography.body2.fontSize,
  borderRadius: theme.shape.borderRadius,
  flexGrow: 0,
  height: "28px",

  [`&.Mui-selected`]: {
    color: "#fff",
  },
}));
