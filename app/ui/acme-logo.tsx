import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import {CakeIcon} from "@heroicons/react/16/solid";

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <CakeIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Sweetery</p>
    </div>
  );
}
