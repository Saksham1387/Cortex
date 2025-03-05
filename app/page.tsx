import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/16/solid";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Home() {
  return (
    <div className="text-white flex flex-col items-center justify-center h-screen p-1">
      <div className="flex flex-row">
        <Image
          src={"/white-icon.png"}
          alt="das"
          width={100}
          height={100}
          className="ml-10"
        ></Image>
        <h1 className="text-5xl font-bold mt-5">CortexQ</h1>
      </div>
      <div className="flex flex-row mt-3 ml-7">
        <ArrowLeftCircleIcon className="h-5 w-5 animate-pulse mr-2 mt-[3px]"></ArrowLeftCircleIcon>
        <h2 className="font-thin mb-[80px]">
          Click on the new chat button to start asking questions !
        </h2>
      </div>

      <div className="flex space-x-3 text-center">
        <div>
          <div className="flex flex-col items-center justify-center mb-5">
            {/* sun IMage */}
            <SunIcon className="h-5 w-5 text-white" />
            <h2>Examples</h2>
          </div>
          <div className="space-y-2 rounded-xl">
            <p className="info-text">Life on Mars?</p>
            <p className="info-text">How far is Mars ?</p>
            <p className="info-text">What is a Nebula ?</p>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-center justify-center mb-5">
            {/* sun Image */}
            <BoltIcon className="h-5 w-5 text-white" />
            <h2>Capabilites</h2>
          </div>
          <div className="space-y-2">
            <p className="info-text">Ask me Anything</p>
            <p className="info-text">Dark matter explanation?</p>
            <p className="info-text">Solar wind effects?</p>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-center justify-center mb-5">
            {/* sun IMage */}
            <ExclamationTriangleIcon className="h-5 w-5 text-white animate-pulse" />
            <h2>No Limitations</h2>
          </div>
          <div className="space-y-2">
            <p className="info-text">Moon's origin?</p>
            <p className="info-text">Supernova process?</p>
            <p className="info-text">Space-time fabric?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
