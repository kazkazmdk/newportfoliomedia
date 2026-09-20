"use client";

import Image from "next/image";
import {
  cableMediaOf,
  chargerMediaOf,
  deviceMediaOf,
  hardwareHonesty,
} from "@/lib/hardware-media";

export function DeviceObject({ slug, name, limit = false, watts }: { slug: string; name: string; limit?: boolean; watts?: number }) {
  const media = deviceMediaOf(slug);
  return (
    <figure className={`cm-object is-${media.classId}${limit ? " is-limit" : ""}`} data-representation={media.representation}>
      <div className="cm-hw is-device">
        <Image src={media.hero} alt="" className="cm-hw-img" width={media.classId === "laptop" ? 960 : 480} height={media.classId === "laptop" ? 540 : 640} />
        <span className="cm-hw-port is-device" aria-hidden />
      </div>
      <figcaption>
        <strong className="cm-object-name">{name}</strong>
        {watts != null ? <span className="cm-mono">{watts}W max</span> : null}
        <small>{hardwareHonesty(media.representation)}</small>
        {limit ? <em>DEVICE · {watts ?? "—"}W LIMIT</em> : null}
      </figcaption>
    </figure>
  );
}

export function ChargerObject({
  watts,
  ports,
  limit = false,
  limitTarget,
  name,
}: {
  watts: number;
  ports: number;
  limit?: boolean;
  limitTarget?: "port" | "charger";
  name?: string;
}) {
  const media = chargerMediaOf(watts, ports);
  return (
    <figure className={`cm-object is-brick is-${media.classId}${limit ? " is-limit" : ""}${limitTarget ? ` is-limit-${limitTarget}` : ""}`} data-representation={media.representation}>
      <div className={`cm-hw is-brick is-${media.classId}`}>
        <Image src={media.hero} alt="" className="cm-hw-img" width={640} height={640} />
        <span className="cm-hw-port is-charger" aria-hidden />
        <span className="cm-hw-watt cm-mono">{watts}W</span>
      </div>
      <figcaption>
        <strong className="cm-object-name">{name ?? `${ports} ${ports === 1 ? "port" : "ports"}`}</strong>
        <span className="cm-mono">{watts}W</span>
        <small>{hardwareHonesty(media.representation)}</small>
        {limit ? <em>CHARGER · {watts}W LIMIT</em> : null}
      </figcaption>
    </figure>
  );
}

export function CablePath({
  watts,
  limit = false,
  axis = "vertical",
  name,
}: {
  watts: number;
  limit?: boolean;
  axis?: "vertical" | "horizontal";
  name?: string;
}) {
  const media = cableMediaOf(watts);
  return (
    <figure className={`cm-cable-object is-${axis}${limit ? " is-limit" : ""}`} data-representation={media.representation}>
      <div className="cm-cable-photo">
        <Image src={media.hero} alt="" className="cm-hw-img" width={1280} height={720} />
        <span className="cm-cable-current" aria-hidden />
      </div>
      <svg className={`cm-cable-path is-${axis}${limit ? " is-limit" : ""}`} viewBox={axis === "vertical" ? "0 0 80 120" : "0 0 100 80"} aria-hidden>
        <path className="cm-cable-line" d={axis === "vertical" ? "M40 10 C40 36 22 52 40 110" : "M10 40 C36 40 48 22 90 40"} />
        <circle className="cm-cable-current" r="3.5" cx={axis === "vertical" ? 40 : 12} cy={axis === "vertical" ? 12 : 40}>
          <animateMotion dur="1.6s" repeatCount="indefinite" path={axis === "vertical" ? "M40 12 C40 36 22 52 40 108" : "M12 40 C36 40 48 22 88 40"} />
        </circle>
      </svg>
      <figcaption>
        <strong className="cm-object-name">{name ?? media.cableType}</strong>
        <span className="cm-mono">{Number.isFinite(watts) ? `${watts}W` : "uncapped"}</span>
        <small>{hardwareHonesty(media.representation)}</small>
        {limit ? <em>CABLE · {watts}W LIMIT</em> : null}
      </figcaption>
    </figure>
  );
}

export function PhoneHardware() {
  return <DeviceObject slug="iphone-16" name="Phone class" />;
}

export function LaptopHardware() {
  return <DeviceObject slug="macbook-air-13-m3" name="Laptop class" />;
}

export function TabletHardware() {
  return <DeviceObject slug="ipad-pro-m4" name="Tablet class" />;
}

export function ChargerBrick({ watts, ports }: { watts: number; ports: number }) {
  return <ChargerObject watts={watts} ports={ports} />;
}
