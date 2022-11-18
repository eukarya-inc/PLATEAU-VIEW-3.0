import { postMsg } from "@web/extensions/sidebar/core/utils";
import DatasetsPage from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetsPage";
import YourDataPage from "@web/extensions/sidebar/modals/datacatalog/components/content/YourDataPage";
import { Data } from "@web/extensions/sidebar/modals/datacatalog/types";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

export type Tab = "dataset" | "your-data";

const DataCatalog: React.FC = () => {
  const [currentTab, changeTabs] = useState<Tab>("dataset");

  const addedDatasets = undefined; // Need to pass from Sidebar when Datacatalog is opened

  const handleClose = useCallback(() => {
    postMsg({ action: "modal-close" });
  }, []);

  const handleDatasetAdd = useCallback(
    (dataset: Data) => {
      postMsg({
        action: "msgFromModal",
        payload: {
          dataset,
        },
      });
      handleClose();
    },
    [handleClose],
  );

  return (
    <Wrapper>
      <Header>
        <Title>Data Catalogue</Title>
        <TabsWrapper>
          <Tab selected={currentTab === "dataset"} onClick={() => changeTabs("dataset")}>
            <Logo icon="plateauLogoPart" selected={currentTab === "dataset"} />
            <TabName>PLATEAU Dataset</TabName>
          </Tab>
          <Tab selected={currentTab === "your-data"} onClick={() => changeTabs("your-data")}>
            <Icon icon="user" />
            <TabName>Your Data</TabName>
          </Tab>
        </TabsWrapper>
        <CloseButton>
          <Icon size={32} icon="close" onClick={handleClose} />
        </CloseButton>
      </Header>
      {currentTab === "your-data" ? (
        <YourDataPage onDatasetAdd={handleDatasetAdd} />
      ) : (
        <DatasetsPage addedDatasets={addedDatasets} onDatasetAdd={handleDatasetAdd} />
      )}
    </Wrapper>
  );
};

export default DataCatalog;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 905px;
  height: 590px;
  background: #f4f4f4;
  box-shadow: 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px rgba(0, 0, 0, 0.08),
    0px 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  background: #dcdcdc;
  height: 48px;
  position: relative;
`;

const Title = styled.p`
  align-self: center;
  font-size: 14px;
  font-weight: 700;
  margin: 0 12px;
  color: #4a4a4a;
`;

const TabsWrapper = styled.div`
  display: flex;
  margin: 8px 10px 0 10px;
  gap: 10px;
`;

const Tab = styled.div<{ selected?: boolean }>`
  display: flex;
  gap: 8px;
  border-width: 1px 1px 0px 1px;
  border-style: solid;
  border-color: ${({ selected }) => (selected ? "#f4f4f4" : "#c8c8c8")};
  border-radius: 2px 2px 0px 0px;
  background: ${({ selected }) => (selected ? "#f4f4f4" : "#c8c8c8")};
  color: ${({ selected }) => (selected ? "#00BEBE" : "#898989")};
  padding: 8px 12px;
  cursor: pointer;
`;

const Logo = styled(Icon)<{ selected?: boolean }>`
  opacity: ${({ selected }) => (selected ? 1 : 0.4)};
`;

const TabName = styled.p`
  margin: 0;
  user-select: none;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0;
  height: 48px;
  width: 48px;
  border: none;
  background: #00bebe;
  cursor: pointer;
`;
