import { useStep } from "@/contexts/stepContext";
import { useAuth } from "@/components/AuthProvider";
import Icon from "@/assets/logo/logo";
import PrepImmediate from "@/assets/icons/prepImmediate";
import PrepBatch1Hr from "@/assets/icons/prep-batch-1hr";
import PrepBatch3Hr from "@/assets/icons/prep-batch-3hr";
import PrepBatch24Hr from "@/assets/icons/prep-batch-24";
import AdminForecast from "@/assets/icons/icon-admin-forecast";
import AdminStockOrder from "@/assets/icons/icon-admin-stock-order";
import AdminStockCount from "@/assets/icons/icon-admin-stock-count";

export default function RestaurantSidebar() {
  const { currentStep, setCurrentStep } = useStep();
  const { user } = useAuth();

  return (
    <div className="w-18 bg-neutral-black text-white flex flex-col items-center">
      <div className="p-2  border-slate-700">
        <Icon width={64} height={64} />
      </div>

      <nav className=" p-4 mr-[-8px]">
        <ul className="space-y-1">
          <button
            onClick={() => setCurrentStep(0)}
            className={`bg-ui-primary-light px-4 py-4 rounded-l-lg  ${
              currentStep === 0
                ? "bg-ui-secondary border-t-4 border-b-4 border-l-4 "
                : "bg-ui-primary-light border-t-4 border-b-4 border-l-4 border-[#050c1f]"
            }`}
          >
            <PrepImmediate
              width={32}
              height={32}
              color={`${currentStep === 0 ? "#1e3678" : "white"}`}
            />
          </button>
          <div
            className={`${
              currentStep === 1 || currentStep === 2 || currentStep === 3
                ? "py-1  pl-1 rounded-l-lg  bg-white"
                : "py-2 pl-1 rounded-l-lg  bg-[#050c1f]"
            }`}
          >
            <button
              onClick={() => setCurrentStep(1)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg mb-1 ${
                currentStep === 1 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <PrepBatch1Hr
                width={32}
                height={32}
                color={`${currentStep === 1 ? "#1e3678" : "white"}`}
              />
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg mb-1 ${
                currentStep === 2 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <PrepBatch3Hr
                width={32}
                height={32}
                color={`${currentStep === 2 ? "#1e3678" : "white"}`}
              />
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg  ${
                currentStep === 3 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <PrepBatch24Hr
                width={32}
                height={32}
                color={`${currentStep === 3 ? "#1e3678" : "white"}`}
              />
            </button>
          </div>
          <div
            className={`${
              currentStep === 4 || currentStep === 5 || currentStep === 4
                ? "py-1  pl-1 rounded-l-lg  bg-white"
                : "py-2 pl-1 rounded-l-lg  bg-[#050c1f]"
            }`}
          >
            <button
              onClick={() => setCurrentStep(4)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg mb-1 ${
                currentStep === 4 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <AdminForecast
                width={32}
                height={32}
                color={`${currentStep === 4 ? "#1e3678" : "white"}`}
              />
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg mb-1 ${
                currentStep === 5 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <AdminStockCount
                width={32}
                height={32}
                color={`${currentStep === 5 ? "#1e3678" : "white"}`}
              />
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className={`bg-ui-primary-light px-4 py-4 rounded-l-lg  ${
                currentStep === 6 ? "bg-ui-secondary" : "bg-ui-primary-light"
              }`}
            >
              <AdminStockOrder
                width={32}
                height={32}
                color={`${currentStep === 6 ? "#1e3678" : "white"}`}
              />
            </button>
          </div>
        </ul>
      </nav>
    </div>
  );
}
