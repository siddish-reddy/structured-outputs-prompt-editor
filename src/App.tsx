import { useState, useEffect , useRef} from "react";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";


const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset textarea height to auto to correctly calculate the scrollHeight
      textareaRef.current.style.height = "auto";
      // Set the height to scrollHeight to adjust the height based on content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      {...props}
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("w-full overflow-hidden resize-none", className)}
      rows={1}
    />
  );
};


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
        input: "Example input from user/document/response.\nStart with simple examples. Then add combination of nuances, edge cases, and errors.",
        output: {
          json_key_1: "Example output for this key from LLM",
          another_key: "Now delete these scenarios and start adding your own!",
        },
      },
      "Scenario/example 2": {
        input: "Diversity of inputs/scenarios is more important than quantity.",
        output: {}
      }
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
            <Button onClick={copyToClipboard} variant={"outline"} className="border-2 border-slate-400" >
              <Clipboard className="mr-2 h-4 w-4" /> Copy to Clipboard
            </Button>
            <Button onClick={pasteFromClipboard} variant={"outline"} className="border-2 border-slate-400">
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
          <Button onClick={handleAddScenario} variant={"secondary"}>
            <Plus className="mr-2.5 h-4 w-4" /> Add Scenario
          </Button>
        </div>
        {Object.entries(data).map(([scenarioName, scenario]) => (
          <Card key={scenarioName} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between scenarios-center">
                <span>{scenarioName}</span>
                <Button
                  variant={"secondary"}
                  size="sm"
                  className="h-4 rounded-sm p-1 text-xs"
                  onClick={() => handleDeleteScenario(scenarioName)}
                >
                  <Trash2 className="h-3 w-2 text-red-700" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-2 font-medium">User:</label>
                <AutoResizeTextarea
                  value={scenario.input}
                  onChange={(e) =>
                    handleInputChange(scenarioName, e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div >
                <label className="block mb-2 font-medium">Assistant:</label>
                {Object.entries(scenario.output).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="block text-md mb-1 ml-2 font-mono">{key}:</label>
                    <AutoResizeTextarea
                      value={value}
                      onChange={(e) =>
                        handleOutputChange(scenarioName, key, e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                ))}
                <div className="flex mt-2">
                  <Input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="New output key name"
                    className="mr-2 max-w-48 font-mono"
                  />
                  <Button onClick={() => handleAddOutputKey(scenarioName)} variant={"outline"} className="border-slate-300">
                    <Plus className="mr-2 h-4 w-4" /> Add Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex mb-4">
          <Input
            type="text"
            value={currentScenario}
            onChange={(e) => setCurrentScenario(e.target.value)}
            placeholder="Enter new scenario name"
            className="mr-2 max-w-96"
            id="scenarioName"
          />
          <Button onClick={handleAddScenario} variant={"secondary"}>
            <Plus className="mr-2.5 h-4 w-4" /> Add Scenario
          </Button>
        </div>
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
