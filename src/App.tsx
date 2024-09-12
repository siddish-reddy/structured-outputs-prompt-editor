import { useState, useEffect } from "react";
import { Trash2, Plus, Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const App = () => {
  interface Scenario {
    input: string;
    output: { [key: string]: string };
  }

  function fetchDataIfPresent():
    | { [key: string]: Scenario }
    | (() => { [key: string]: Scenario }) {
    const localData = localStorage.getItem("jsonPromptData");
    if (localData) {
      return JSON.parse(localData);
    }
    return {
      "Add one simple scenario": {
        input: "Example input from user/document/response",
        output: {
          json_key_1: "Example output for this key from LLM",
          another_key: "Now delete these scenarios and start adding your own!",
        },
      },
    };
  }

  const [data, setData] = useState<{ [key: string]: Scenario }>(
    fetchDataIfPresent()
  );
  const [currentScenario, setCurrentScenario] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    localStorage.setItem("jsonPromptData", JSON.stringify(data));
  }, [data]);

  const handleAddScenario = () => {
    if (currentScenario && !data[currentScenario]) {
      setData((prev) => ({
        ...prev,
        [currentScenario]: { input: "", output: {} },
      }));
      setCurrentScenario("");
    }
  };

  const handleDeleteScenario = (scenarioName: string) => {
    setData((prev) => {
      const newData = { ...prev };
      delete newData[scenarioName];
      return newData;
    });
  };

  const handleInputChange = (scenarioName: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [scenarioName]: { ...prev[scenarioName], input: value },
    }));
  };

  const handleOutputChange = (
    scenarioName: string,
    key: string,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [scenarioName]: {
        ...prev[scenarioName],
        output: { ...prev[scenarioName].output, [key]: value },
      },
    }));
  };

  const handleAddOutputKey = (scenarioName: string) => {
    if (newKeyName && !data[scenarioName].output[newKeyName]) {
      setData((prev) => ({
        ...prev,
        [scenarioName]: {
          ...prev[scenarioName],
          output: { ...prev[scenarioName].output, [newKeyName]: "" },
        },
      }));
      setNewKeyName("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        setAlert({
          show: true,
          message: "Data copied to clipboard!",
          type: "success",
        });
        setTimeout(
          () => setAlert({ show: false, message: "", type: "" }),
          3000
        );
      })
      .catch(() => {
        setAlert({
          show: true,
          message: "Failed to copy data.",
          type: "error",
        });
        setTimeout(
          () => setAlert({ show: false, message: "", type: "" }),
          3000
        );
      });
  };

  const pasteFromClipboard = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        try {
          const pastedData = JSON.parse(text);
          setData(pastedData);
          setAlert({
            show: true,
            message: "Data pasted successfully!",
            type: "success",
          });
          setTimeout(
            () => setAlert({ show: false, message: "", type: "" }),
            3000
          );
        } catch (error) {
          setAlert({
            show: true,
            message: "Invalid data format.",
            type: "error",
          });
          setTimeout(
            () => setAlert({ show: false, message: "", type: "" }),
            3000
          );
        }
      })
      .catch(() => {
        setAlert({
          show: true,
          message: "Failed to read clipboard.",
          type: "error",
        });
        setTimeout(
          () => setAlert({ show: false, message: "", type: "" }),
          3000
        );
      });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 flex space-x-2 p-4 bg-white border-b shadow-sm mb-4 px-[5vw]">
        <div className="flex justify-between w-full">
          <h1 className="text-2xl font-bold">JSON Outputs Dataset</h1>
          <div className="flex space-x-2">
            <Button onClick={copyToClipboard}>
              <Clipboard className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
            <Button onClick={pasteFromClipboard}>
              <ClipboardCheck className="mr-2 h-4 w-4" /> Paste from Clipboard
            </Button>
          </div>
        </div>
        {alert.show && (
          <Alert
            className={`mb-4 ${
              alert.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="p-4 w-[90vw] mx-[5vw]">
        <div className="flex mb-4">
          <Input
            type="text"
            value={currentScenario}
            onChange={(e) => setCurrentScenario(e.target.value)}
            placeholder="Enter new scenario name"
            className="mr-2 max-w-96"
            id="scenarioName"
          />
          <Button onClick={handleAddScenario}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Scenario
          </Button>
        </div>
        {Object.entries(data).map(([scenarioName, scenario]) => (
          <Card key={scenarioName} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between scenarios-center">
                <span>{scenarioName}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteScenario(scenarioName)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">User:</label>
                <Textarea
                  value={scenario.input}
                  onChange={(e) =>
                    handleInputChange(scenarioName, e.target.value)
                  }
                  rows={4}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Assistant:</label>
                {Object.entries(scenario.output).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="block text-md">{key}:</label>
                    <Textarea
                      value={value}
                      onChange={(e) =>
                        handleOutputChange(scenarioName, key, e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                ))}
                <div className="flex mt-2">
                  <Input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="New output key name"
                    className="mr-2"
                  />
                  <Button onClick={() => handleAddOutputKey(scenarioName)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <p className="text-sm mb-2">
          - Data will always be saved in your browser's local storage, so go ahead and refresh or close this tab. You can also copy and
          paste the data to/from clipboard.<br />
          - Out of Scope: Copy to clipboard and convert to JSON/YAML, then stitch for few shots or finetuning dataset.
        </p>
        <p className="text-sm">
        Thanks Claude
        </p>
      </div>
    </div>
  );
};

export default App;
