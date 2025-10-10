import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrintLabelStore } from "@/store/forecastStore";
import { Button } from "@/components/ui/Button";

export default function PrintPreview() {
  const { showPreview, setShowPreview, selectedItems, previewMeta } =
    usePrintLabelStore();

  const handleClose = () => {
    setShowPreview(false);
  };

  // Generate labels for printing - each item repeated by labelCount
  const generateLabels = () => {
    const labels: Array<{ id: number; name: string; index: number }> = [];
    selectedItems.forEach((item) => {
      for (let i = 0; i < item.labelCount; i++) {
        labels.push({
          id: item.id,
          name: item.name,
          index: i + 1,
        });
      }
    });
    return labels;
  };

  const labels = generateLabels();
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const currentTime =
    previewMeta?.prepTime ||
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const expiryTime = previewMeta?.expiryTime;

  const handlePrint = () => {
    // Render into a hidden iframe to avoid popup blockers/blank pages
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const labelsMarkup = labels
      .map(
        (label) => `
        <div class=\"label-item\"> 
          <div class=\"label-card\">
            <div class=\"label-header\"><h3>${label.name}</h3></div>
            <div class=\"label-body\">
              <div class=\"row\">
                <div class=\"cell\">
                  <p class=\"hint\">Prep Date:</p>
                  <p class=\"value\">${currentDate}</p>
                </div>
                <div class=\"cell\">
                  <p class=\"hint\">Prep Time:</p>
                  <p class=\"value\">${currentTime}</p>
                </div>
              </div>
              ${
                expiryTime
                  ? `<div class=\"row\"><div class=\"cell\"><p class=\"hint\">Expiry Time:</p><p class=\"value\">${expiryTime}</p></div></div>`
                  : ""
              }
              <div class=\"field\"><p class=\"hint\">Use By Date:</p><div class=\"input\"></div></div>
              <div class=\"field\"><p class=\"hint\">Prepared By:</p><div class=\"input\"></div></div>
            </div>
            <div class=\"label-footer\"><p>Label ${label.index} of ${
          labels.filter((l) => l.id === label.id).length
        }</p></div>
          </div>
        </div>`
      )
      .join("");

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>Print Labels</title>
    <style>
      @page { size: A4; margin: 12mm; }
      html, body { padding: 0; margin: 0; background: #ffffff; color: #111827; }
      * { box-sizing: border-box; }
      .grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 8mm; }
      .label-item { break-inside: avoid; page-break-inside: avoid; }
      .label-card { border: 2px solid #1f2937; border-radius: 6px; padding: 6mm; height: 100%; background: #fff; }
      .label-header { border-bottom: 2px solid #1f2937; padding-bottom: 3mm; margin-bottom: 4mm; }
      .label-header h3 { margin: 0; font: 700 14pt system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111827; }
      .label-body .row { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-bottom: 4mm; }
      .hint { margin: 0 0 1mm 0; color: #6b7280; font: 600 8pt system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .value { margin: 0; color: #111827; font: 700 10pt system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .field { margin-bottom: 3mm; }
      .input { border: 1px solid #9ca3af; border-radius: 4px; height: 9mm; }
      .label-footer { border-top: 2px solid #1f2937; margin-top: 4mm; padding-top: 2mm; text-align: center; }
      .label-footer p { margin: 0; color: #6b7280; font: 400 8pt system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    </style>
  </head>
  <body>
    <div class=\"grid\">${labelsMarkup}</div>
    <script>window.onload = function () { window.focus(); window.print(); }<\/script>
  </body>
</html>`);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    };
  };

  return (
    <>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent
          className="max-w-6xl max-h-[90vh] overflow-y-auto"
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Print Preview
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex gap-3 mb-6 print:hidden">
              <Button
                onClick={handlePrint}
                className="bg-[#1f3678] hover:bg-[#1a2e66] text-white"
              >
                Print Labels
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>

            {/* Print Preview Content */}
            <div className="print-preview-content">
              <style jsx>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .print-preview-content,
                  .print-preview-content * {
                    visibility: visible;
                  }
                  .print-preview-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  .label-item {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                }
              `}</style>

              <div className="grid grid-cols-1 gap-4 print:grid-cols-1">
                {labels.map((label, idx) => (
                  <div
                    key={`${label.id}-${idx}`}
                    className="label-item border-2 border-gray-800 p-4 rounded-lg bg-white"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="border-b-2 border-gray-800 pb-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {label.name}
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">
                              Prep Date:
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {currentDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium">
                              Prep Time:
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {currentTime}
                            </p>
                          </div>
                        </div>

                        {expiryTime && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium">
                              Expiry Time:
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {expiryTime}
                            </p>
                          </div>
                        )}

                        {/* <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Use By Date:
                          </p>
                          <div className="border border-gray-400 rounded p-2 mt-1 min-h-[32px] bg-white"></div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Prepared By:
                          </p>
                          <div className="border border-gray-400 rounded p-2 mt-1 min-h-[32px] bg-white"></div>
                        </div> */}
                      </div>

                      {/* Footer */}
                      <div className="border-t-2 border-gray-800 pt-2 mt-3">
                        <p className="text-xs text-gray-500 text-center">
                          Label {label.index} of{" "}
                          {labels.filter((l) => l.id === label.id).length}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg print:hidden">
              <h4 className="font-semibold text-gray-900 mb-2">
                Print Summary
              </h4>
              <p className="text-sm text-gray-700">
                Total Labels: <span className="font-bold">{labels.length}</span>
              </p>
              <p className="text-sm text-gray-700">
                Items: <span className="font-bold">{selectedItems.length}</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
