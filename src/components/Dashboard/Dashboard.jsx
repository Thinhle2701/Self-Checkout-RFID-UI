import React, { useEffect, useState } from "react";
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import Select from "react-select";

const Dashboard = () => {
  const [revenueSorting, setRevenueSorting] = useState("Date");
  const [isLoading, setIsLoading] = useState(true);
  const options = [
    { value: "Date", label: "Date" },
    { value: "Month", label: "Month" },
  ];

  const sdk = new ChartsEmbedSDK({
    baseUrl: "https://charts.mongodb.com/charts-project-0-mvluv",
  });

  const paymentChart = sdk.createChart({
    chartId: "659e35b8-e9a8-4ea5-875e-ecfd7c3b595a",
  });

  const scannedItemChart = sdk.createChart({
    chartId: "659e6a33-8e58-43c2-887e-9635c499ea51",
  });
  const revenueChartMonth = sdk.createChart({
    chartId: "659e5432-9187-448c-89a5-ee6cca84430e",
  });
  const revenueChartDate = sdk.createChart({
    chartId: "659e5649-9187-4bb5-8f1f-ee6cca9ea869",
  });
  const orderdProduct = sdk.createChart({
    chartId: "659e6f5c-194b-44cf-8ab8-805a6fa84d50",
  });
  const inventory = sdk.createChart({
    chartId: "659e7350-11b7-4f3f-8e50-7ed8f473344b",
  });
  useEffect(() => {
    paymentChart.render(document.getElementById("chart-data"));
    scannedItemChart.render(document.getElementById("scanneditem-data"));
    revenueChartMonth.render(document.getElementById("revenuechartmonth-data"));
    revenueChartDate.render(document.getElementById("revenuechartdate-data"));
    orderdProduct.render(document.getElementById("orderedproduct-data"));
    inventory.render(document.getElementById("inventory-data"));
    setIsLoading(false);
    // .catch(() => window.alert("Chart failed to initialise"));
  }, [
    isLoading,
    sdk,
    revenueSorting,
    paymentChart,
    scannedItemChart,
    revenueChartMonth,
    revenueChartDate,
  ]);
  return (
    <div>
      {isLoading === true ? (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translate(0px, -50%)",
              left: "30%",
            }}
          >
            <img src="https://img.pikbest.com/png-images/20190918/cartoon-snail-loading-loading-gif-animation_2734139.png!bw700"></img>
          </div>
        </>
      ) : (
        <>
          <div>
            <h1
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Dashboard
            </h1>
            <div style={{ display: "flex", marginLeft: "100px" }}>
              <div>
                <h2 style={{ marginLeft: "50px" }}>Payment Method Chart</h2>
                <div id="chart-data" style={{ height: 700, width: 700 }}></div>
              </div>
              <div style={{ marginLeft: "300px" }}>
                <h2 style={{ marginLeft: "300px" }}>Scanned Items</h2>
                <div
                  id="scanneditem-data"
                  style={{ height: 700, width: 700 }}
                ></div>
              </div>
            </div>
            <div>
              <div
                style={{
                  marginLeft: "50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h2>Revenue Chart</h2>
                <h2 style={{ marginLeft: "100px" }}></h2>
                <div style={{}}>
                  <h4 style={{}}>Sorting By</h4>
                  <Select
                    styles={{ width: "40px" }}
                    options={options}
                    placeholder={revenueSorting}
                    defaultValue={revenueSorting}
                    onChange={(e) => {
                      console.log("test", e.value);
                      setRevenueSorting(e.value);
                    }}
                  />
                </div>
              </div>
            </div>
            {revenueSorting === "Date" ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    id="revenuechartdate-data"
                    style={{ height: 700, width: 700 }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                {" "}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    id="revenuechartmonth-data"
                    style={{ height: 700, width: 700 }}
                  ></div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", marginLeft: "100px" }}>
            <div>
              <h2 style={{ marginLeft: "250px" }}>Sold Product Chart</h2>
              <div
                id="orderedproduct-data"
                style={{ height: 700, width: 700 }}
              ></div>
            </div>
            <div style={{ marginLeft: "300px" }}>
              <h2 style={{ marginLeft: "300px" }}>Inventory Chart</h2>
              <div
                id="inventory-data"
                style={{ height: 700, width: 700 }}
              ></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
