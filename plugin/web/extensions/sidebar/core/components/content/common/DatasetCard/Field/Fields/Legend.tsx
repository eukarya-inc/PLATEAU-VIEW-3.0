import AddButton from "@web/extensions/sidebar/core/components/content/common/AddButton";
import { Icon, Dropdown, Menu } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseField as BaseFieldProps } from ".";

type LegendStyleType = "square" | "circle" | "line" | "icon";

const legendStyles: { [key: string]: string } = {
  square: "四角",
  circle: "丸",
  line: "線",
  icon: "アイコン",
};

type LegendItem = {
  title: string;
  color: string;
  url?: string;
};

type Legend = {
  id?: string; // NOT SURE ID IS NEEDED OR WILL BE OBTAINABLE
  style: LegendStyleType;
  items?: LegendItem[];
};

type Props = BaseFieldProps<"legend"> & {
  value: Legend;
  editMode?: boolean;
};

function array_move(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

const Legend: React.FC<Props> = ({ value, editMode }) => {
  const [legend, updateLegend] = useState<Legend>(value);

  const handleStyleChange = useCallback((style: LegendStyleType) => {
    updateLegend(l => {
      return {
        ...l,
        style,
      };
    });
  }, []);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    updateLegend(l => {
      let newItems: LegendItem[] | undefined = undefined;
      if (l.items) {
        newItems = l.items;
        array_move(newItems, idx, idx - 1);
      }
      return { ...l, items: newItems };
    });
  }, []);

  const handleMoveDown = useCallback(
    (idx: number) => {
      if (legend.items && idx >= legend.items.length - 1) return;
      updateLegend(l => {
        let newItems: LegendItem[] | undefined = undefined;
        if (l.items) {
          newItems = l.items;
          array_move(newItems, idx, idx + 1);
        }
        return { ...l, items: newItems };
      });
    },
    [legend.items],
  );

  const handleAdd = useCallback(() => {
    alert("ADD ITEM");
  }, []);

  const handleRemove = useCallback((idx: number) => {
    updateLegend(l => {
      let newItems: LegendItem[] | undefined = undefined;
      if (l.items) {
        newItems = l.items.filter((_, idx2) => idx2 != idx);
      }
      return { ...l, items: newItems };
    });
  }, []);

  // [
  //   {
  //     key: "1",
  //     label: (
  //       <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
  //         1st menu item
  //       </a>
  //     ),
  //   },
  //   {
  //     key: "2",
  //     label: (
  //       <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
  //         2nd menu item (disabled)
  //       </a>
  //     ),
  //     // icon: <SmileOutlined />,
  //     disabled: true,
  //   },
  //   {
  //     key: "3",
  //     label: (
  //       <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
  //         3rd menu item (disabled)
  //       </a>
  //     ),
  //     disabled: true,
  //   },
  //   {
  //     key: "4",
  //     danger: true,
  //     label: "a danger item",
  //   },
  // ]

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
                <TextInput value={item.url} />
              </FieldValue>
            </Field>
          )}
          <Field>
            <FieldTitle>色</FieldTitle>
            <FieldValue>
              <ColorBlock color={item.color} />
              <TextInput value={item.color} />
            </FieldValue>
          </Field>
          <Field>
            <FieldTitle>タイトル</FieldTitle>
            <FieldValue>
              <TextInput value={item.title} />
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
