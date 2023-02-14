import AddButton from "@web/extensions/sidebar/core/components/content/common/DatasetCard/AddButton";
import { array_move } from "@web/extensions/sidebar/utils";
import { Icon, Dropdown, Menu } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, LegendItem, LegendStyleType } from "../types";

const legendStyles: { [key: string]: string } = {
  square: "四角",
  circle: "丸",
  line: "線",
  icon: "アイコン",
};

const Legend: React.FC<BaseFieldProps<"legend">> = ({ value, editMode, onUpdate }) => {
  const [legend, updateLegend] = useState(value);

  const handleStyleChange = useCallback(
    (style: LegendStyleType) => {
      updateLegend(l => {
        const newLegend = {
          ...l,
          style,
        };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const handleMoveUp = useCallback(
    (idx: number) => {
      if (idx === 0) return;
      updateLegend(l => {
        let newItems: LegendItem[] | undefined = undefined;
        if (l.items) {
          newItems = l.items;
          array_move(newItems, idx, idx - 1);
        }
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const handleMoveDown = useCallback(
    (idx: number) => {
      if (legend.items && idx >= legend.items.length - 1) return;
      updateLegend(l => {
        let newItems: LegendItem[] | undefined = undefined;
        if (l.items) {
          newItems = l.items;
          array_move(newItems, idx, idx + 1);
        }
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [legend, onUpdate],
  );

  const handleAdd = useCallback(() => {
    updateLegend(l => {
      const newItem = {
        title: "New Item",
        color: "white",
      };
      const newLegend = {
        ...l,
        items: l.items ? [...l.items, newItem] : [newItem],
      };
      onUpdate(newLegend);
      return newLegend;
    });
  }, [onUpdate]);

  const handleRemove = useCallback(
    (idx: number) => {
      updateLegend(l => {
        let newItems: LegendItem[] | undefined = undefined;
        if (l.items) {
          newItems = l.items.filter((_, idx2) => idx2 != idx);
        }
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const handleURLChange = useCallback(
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateLegend(l => {
        if (!l.items) return l;
        const newItems = l.items;
        newItems[idx].url = e.currentTarget.value;
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const handleColorChange = useCallback(
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateLegend(l => {
        if (!l.items) return l;
        const newItems = l.items;
        newItems[idx].color = e.currentTarget.value;
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const handleTitleChange = useCallback(
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateLegend(l => {
        if (!l.items) return l;
        const newItems = l.items;
        newItems[idx].title = e.currentTarget.value;
        const newLegend = { ...l, items: newItems };
        onUpdate(newLegend);
        return newLegend;
      });
    },
    [onUpdate],
  );

  const menu = (
    <Menu
      items={Object.keys(legendStyles).map(ls => {
        return {
          key: ls,
          label: (
            <p style={{ margin: 0 }} onClick={() => handleStyleChange(ls as LegendStyleType)}>
              {legendStyles[ls]}
            </p>
          ),
        };
      })}
    />
  );

  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>スタイル</FieldTitle>
        <FieldValue>
          <Dropdown overlay={menu} placement="bottom" trigger={["click"]}>
            <StyledDropdownButton>
              <p style={{ margin: 0 }}>{legendStyles[legend.style]}</p>
              <Icon icon="arrowDownSimple" size={12} />
            </StyledDropdownButton>
          </Dropdown>
        </FieldValue>
      </Field>
      <AddButton text="項目" onClick={handleAdd} />
      {legend.items?.map((item, idx) => (
        <Item key={idx}>
          <ItemControls>
            <Icon icon="arrowUpThin" size={16} onClick={() => handleMoveUp(idx)} />
            <Icon icon="arrowDownThin" size={16} onClick={() => handleMoveDown(idx)} />
            <Icon icon="trash" size={16} onClick={() => handleRemove(idx)} />
          </ItemControls>
          {legend.style === "icon" && (
            <Field>
              <FieldTitle>URL</FieldTitle>
              <FieldValue>
                <TextInput defaultValue={item.url} onChange={handleURLChange(idx)} />
              </FieldValue>
            </Field>
          )}
          <Field>
            <FieldTitle>色</FieldTitle>
            <FieldValue>
              <ColorBlock color={item.color} />
              <TextInput defaultValue={item.color} onChange={handleColorChange(idx)} />
            </FieldValue>
          </Field>
          <Field>
            <FieldTitle>タイトル</FieldTitle>
            <FieldValue>
              <TextInput defaultValue={item.title} onChange={handleTitleChange(idx)} />
            </FieldValue>
          </Field>
        </Item>
      ))}
    </Wrapper>
  ) : (
    <Wrapper>
      {legend.items?.map((item, idx) => (
        <Field key={idx} gap={12}>
          {legend.style === "icon" ? (
            <StyledImg src={item.url} />
          ) : (
            <ColorBlock color={item.color} legendStyle={legend.style} />
          )}
          <Text>{item.title}</Text>
        </Field>
      ))}
    </Wrapper>
  );
};

export default Legend;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledDropdownButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  align-content: center;
  padding: 0 16px;
  cursor: pointer;
`;

const Text = styled.p`
  margin: 0;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 8px;
`;

const ItemControls = styled.div`
  display: flex;
  justify-content: right;
  gap: 4px;
  cursor: pointer;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  height: 32px;
`;

const FieldTitle = styled(Text)`
  width: 82px;
`;

const FieldValue = styled.div`
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  flex: 1;
  height: 100%;
  width: 100%;
`;

const TextInput = styled.input.attrs({ type: "text" })`
  height: 100%;
  width: 100%;
  flex: 1;
  padding: 0 12px;
  border: none;
  outline: none;

  :focus {
    border: none;
  }
`;

const ColorBlock = styled.div<{ color: string; legendStyle?: "circle" | "square" | "line" }>`
  width: 30px;
  height: ${({ legendStyle }) => (legendStyle === "line" ? "3px" : "30px")};
  background: ${({ color }) => color ?? "#d9d9d9"};
  border-radius: ${({ legendStyle }) =>
    legendStyle
      ? legendStyle === "circle"
        ? "50%"
        : legendStyle === "line"
        ? "5px"
        : "2px"
      : "1px 0 0 1px"};
`;

const StyledImg = styled.img`
  width: 30px;
  height: 30px;
`;
