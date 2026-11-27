import type { AddressPlan } from "@/lib/architecture/types";

/** The IP plan view's drawing: Region A square by square, the rest as boxes. */
export const addressPlan: AddressPlan = {
  region: {
    name: "Region A · asia-southeast1",
    cidr: "10.10.0.0/16",
    subnets: [
      { name: "sn-a-app", cidr: "10.10.0.0/20" },
      { name: "sn-a-mgmt", cidr: "10.10.16.0/24" },
      { name: "sn-a-data", cidr: "10.10.17.0/24" },
      {
        name: "sn-a-proxy",
        cidr: "10.10.250.0/24",
        missing: true,
        defects: ["D12"],
      },
    ],
  },
  others: [
    { cidr: "10.20.0.0/16", label: "Region B · failover", hue: "teal" },
    { cidr: "10.90.0.0/16", label: "PSA · Google's pool", hue: "plum" },
    { cidr: "10.99.0.0/24", label: "PSC · endpoint IPs", hue: "teal" },
    { cidr: "172.20.0.0/16", label: "partner-vpc · peering" },
    { cidr: "192.168.0.0/16", label: "office · HA VPN" },
  ],
};
