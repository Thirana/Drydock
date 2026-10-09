"use client";

// Every chapter widget, loaded on demand. Chapters import widgets from here,
// not from their families, so a chapter page downloads only the widgets it
// renders (all chapters share one route, which would otherwise carry them all).
// Generated from the chapters' imports; add a line when a chapter uses a new widget.
import dynamic from "next/dynamic";

export const AddrFind = dynamic(() =>
  import("./addr-find").then((m) => m.AddrFind),
);
export const AndGrid = dynamic(() => import("./bits").then((m) => m.AndGrid));
export const CidrBar = dynamic(() => import("./bits").then((m) => m.CidrBar));
export const HexDump = dynamic(() => import("./bytes").then((m) => m.HexDump));
export const HexGrid = dynamic(() => import("./bytes").then((m) => m.HexGrid));
export const HexLine = dynamic(() => import("./bytes").then((m) => m.HexLine));
export const IpAnatomy = dynamic(() =>
  import("./bytes").then((m) => m.IpAnatomy),
);
export const MacAnatomy = dynamic(() =>
  import("./bytes").then((m) => m.MacAnatomy),
);
export const PlaceValue = dynamic(() =>
  import("./bytes").then((m) => m.PlaceValue),
);
export const SizeCompare = dynamic(() =>
  import("./bytes").then((m) => m.SizeCompare),
);
export const VpcSlots = dynamic(() =>
  import("./bytes").then((m) => m.VpcSlots),
);
export const CidrCalc = dynamic(() =>
  import("./calculators").then((m) => m.CidrCalc),
);
export const IpConv = dynamic(() =>
  import("./calculators").then((m) => m.IpConv),
);
export const MacDecode = dynamic(() =>
  import("./calculators").then((m) => m.MacDecode),
);
export const ConnectFlow = dynamic(() =>
  import("./capstone").then((m) => m.ConnectFlow),
);
export const CurlTime = dynamic(() =>
  import("./capstone").then((m) => m.CurlTime),
);
export const E2eJourney = dynamic(() =>
  import("./capstone").then((m) => m.E2eJourney),
);
export const E2eModel = dynamic(() =>
  import("./capstone").then((m) => m.E2eModel),
);
export const JoinFlow = dynamic(() =>
  import("./capstone").then((m) => m.JoinFlow),
);
export const LbSim = dynamic(() => import("./capstone").then((m) => m.LbSim));
export const TimeoutChain = dynamic(() =>
  import("./capstone").then((m) => m.TimeoutChain),
);
export const XffSim = dynamic(() => import("./capstone").then((m) => m.XffSim));
export const Chart = dynamic(() => import("./charts").then((m) => m.Chart));
export const CwndSim = dynamic(() => import("./charts").then((m) => m.CwndSim));
export const NetSim = dynamic(() => import("./devices").then((m) => m.NetSim));
export const DkimFlow = dynamic(() =>
  import("./dns-mail").then((m) => m.DkimFlow),
);
export const DnsSim = dynamic(() => import("./dns-mail").then((m) => m.DnsSim));
export const DnsWalk = dynamic(() =>
  import("./dns-mail").then((m) => m.DnsWalk),
);
export const MailSim = dynamic(() =>
  import("./dns-mail").then((m) => m.MailSim),
);
export const MxFlow = dynamic(() => import("./dns-mail").then((m) => m.MxFlow));
export const FwWalk = dynamic(() =>
  import("./gcp/access").then((m) => m.FwWalk),
);
export const LayerEx = dynamic(() =>
  import("./gcp/access").then((m) => m.LayerEx),
);
export const LayerWalk = dynamic(() =>
  import("./gcp/access").then((m) => m.LayerWalk),
);
export const ObjEx = dynamic(() => import("./gcp/access").then((m) => m.ObjEx));
export const RuleEx = dynamic(() =>
  import("./gcp/access").then((m) => m.RuleEx),
);
export const SshCheck = dynamic(() =>
  import("./gcp/access").then((m) => m.SshCheck),
);
export const StatefulEx = dynamic(() =>
  import("./gcp/access").then((m) => m.StatefulEx),
);
export const Cap1 = dynamic(() => import("./gcp/capstone").then((m) => m.Cap1));
export const Cap2 = dynamic(() => import("./gcp/capstone").then((m) => m.Cap2));
export const FinalMap = dynamic(() =>
  import("./gcp/capstone").then((m) => m.FinalMap),
);
export const Quiz1 = dynamic(() =>
  import("./gcp/capstone").then((m) => m.Quiz1),
);
export const Quiz2 = dynamic(() =>
  import("./gcp/capstone").then((m) => m.Quiz2),
);
export const CfCache = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.CfCache),
);
export const CfErrors = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.CfErrors),
);
export const CfMigrate = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.CfMigrate),
);
export const CfOverview = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.CfOverview),
);
export const CfRecords = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.CfRecords),
);
export const OriginLock = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.OriginLock),
);
export const TlsModes = dynamic(() =>
  import("./gcp/cloudflare").then((m) => m.TlsModes),
);
export const ExpCheck = dynamic(() =>
  import("./gcp/foundations").then((m) => m.ExpCheck),
);
export const IpFate = dynamic(() =>
  import("./gcp/foundations").then((m) => m.IpFate),
);
export const PktWalk = dynamic(() =>
  import("./gcp/foundations").then((m) => m.PktWalk),
);
export const RouteEx = dynamic(() =>
  import("./gcp/foundations").then((m) => m.RouteEx),
);
export const RoutePick = dynamic(() =>
  import("./gcp/foundations").then((m) => m.RoutePick),
);
export const ScopeQuiz = dynamic(() =>
  import("./gcp/foundations").then((m) => m.ScopeQuiz),
);
export const SubnetGrid = dynamic(() =>
  import("./gcp/foundations").then((m) => m.SubnetGrid),
);
export const ArmorEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.ArmorEx),
);
export const DeployEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.DeployEx),
);
export const HcEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.HcEx),
);
export const HealEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.HealEx),
);
export const LbChain = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.LbChain),
);
export const LbDecoder = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.LbDecoder),
);
export const LbGlobal = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.LbGlobal),
);
export const LbL7L4 = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.LbL7L4),
);
export const LbTree = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.LbTree),
);
export const MigChain = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.MigChain),
);
export const MigOverview = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.MigOverview),
);
export const ProxyEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.ProxyEx),
);
export const ScaleEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.ScaleEx),
);
export const UpdateEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.UpdateEx),
);
export const UrlMapTool = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.UrlMapTool),
);
export const XffEx = dynamic(() =>
  import("./gcp/frontdoor").then((m) => m.XffEx),
);
export const Constraints = dynamic(() =>
  import("./gcp/governance").then((m) => m.Constraints),
);
export const DriftModel = dynamic(() =>
  import("./gcp/governance").then((m) => m.DriftModel),
);
export const GovHier = dynamic(() =>
  import("./gcp/governance").then((m) => m.GovHier),
);
export const GovRollout = dynamic(() =>
  import("./gcp/governance").then((m) => m.GovRollout),
);
export const Guardrails = dynamic(() =>
  import("./gcp/governance").then((m) => m.Guardrails),
);
export const IacFlow = dynamic(() =>
  import("./gcp/governance").then((m) => m.IacFlow),
);
export const IamFlow = dynamic(() =>
  import("./gcp/governance").then((m) => m.IamFlow),
);
export const OrgPolEx = dynamic(() =>
  import("./gcp/governance").then((m) => m.OrgPolEx),
);
export const VpcScEx = dynamic(() =>
  import("./gcp/governance").then((m) => m.VpcScEx),
);
export const BgpEx = dynamic(() =>
  import("./gcp/growing").then((m) => m.BgpEx),
);
export const FailoverEx = dynamic(() =>
  import("./gcp/growing").then((m) => m.FailoverEx),
);
export const HybridPaths = dynamic(() =>
  import("./gcp/growing").then((m) => m.HybridPaths),
);
export const MtuBar = dynamic(() =>
  import("./gcp/growing").then((m) => m.MtuBar),
);
export const PeeringEx = dynamic(() =>
  import("./gcp/growing").then((m) => m.PeeringEx),
);
export const SharedVpc = dynamic(() =>
  import("./gcp/growing").then((m) => m.SharedVpc),
);
export const VpcOptions = dynamic(() =>
  import("./gcp/growing").then((m) => m.VpcOptions),
);
export const VpnFlows = dynamic(() =>
  import("./gcp/growing").then((m) => m.VpnFlows),
);
export const VpnParts = dynamic(() =>
  import("./gcp/growing").then((m) => m.VpnParts),
);
export const DnsHybrid = dynamic(() =>
  import("./gcp/private").then((m) => m.DnsHybrid),
);
export const DnsOrder = dynamic(() =>
  import("./gcp/private").then((m) => m.DnsOrder),
);
export const GcpDnsWalk = dynamic(() =>
  import("./gcp/private").then((m) => m.GcpDnsWalk),
);
export const NatCalc = dynamic(() =>
  import("./gcp/private").then((m) => m.NatCalc),
);
export const PgaEx = dynamic(() =>
  import("./gcp/private").then((m) => m.PgaEx),
);
export const PrivOverview = dynamic(() =>
  import("./gcp/private").then((m) => m.PrivOverview),
);
export const PsaEx = dynamic(() =>
  import("./gcp/private").then((m) => m.PsaEx),
);
export const PscEx = dynamic(() =>
  import("./gcp/private").then((m) => m.PscEx),
);
export const RunPaths = dynamic(() =>
  import("./gcp/private").then((m) => m.RunPaths),
);
export const SplitEx = dynamic(() =>
  import("./gcp/private").then((m) => m.SplitEx),
);
export const SqlCutover = dynamic(() =>
  import("./gcp/private").then((m) => m.SqlCutover),
);
export const TtlEx = dynamic(() =>
  import("./gcp/private").then((m) => m.TtlEx),
);
export const AlertWin = dynamic(() =>
  import("./gcp/running").then((m) => m.AlertWin),
);
export const ConnTest = dynamic(() =>
  import("./gcp/running").then((m) => m.ConnTest),
);
export const DashMock = dynamic(() =>
  import("./gcp/running").then((m) => m.DashMock),
);
export const FlowCover = dynamic(() =>
  import("./gcp/running").then((m) => m.FlowCover),
);
export const Incidents = dynamic(() =>
  import("./gcp/running").then((m) => m.Incidents),
);
export const LbEntry = dynamic(() =>
  import("./gcp/running").then((m) => m.LbEntry),
);
export const LogCost = dynamic(() =>
  import("./gcp/running").then((m) => m.LogCost),
);
export const ObsMap = dynamic(() =>
  import("./gcp/running").then((m) => m.ObsMap),
);
export const QueryBook = dynamic(() =>
  import("./gcp/running").then((m) => m.QueryBook),
);
export const Rollout = dynamic(() =>
  import("./gcp/running").then((m) => m.Rollout),
);
export const UptimeEx = dynamic(() =>
  import("./gcp/running").then((m) => m.UptimeEx),
);
export const Ipv4Dump = dynamic(() =>
  import("./headers").then((m) => m.Ipv4Dump),
);
export const Ipv4Header = dynamic(() =>
  import("./headers").then((m) => m.Ipv4Header),
);
export const SynDump = dynamic(() =>
  import("./headers").then((m) => m.SynDump),
);
export const TcpHeader = dynamic(() =>
  import("./headers").then((m) => m.TcpHeader),
);
export const UdpBuild = dynamic(() =>
  import("./headers").then((m) => m.UdpBuild),
);
export const UdpDump = dynamic(() =>
  import("./headers").then((m) => m.UdpDump),
);
export const UdpHeader = dynamic(() =>
  import("./headers").then((m) => m.UdpHeader),
);
export const BindSim = dynamic(() =>
  import("./ipv6-ports").then((m) => m.BindSim),
);
export const EuiTool = dynamic(() =>
  import("./ipv6-ports").then((m) => m.EuiTool),
);
export const V6Header = dynamic(() =>
  import("./ipv6-ports").then((m) => m.V6Header),
);
export const V6Tool = dynamic(() =>
  import("./ipv6-ports").then((m) => m.V6Tool),
);
export const ArpFan = dynamic(() =>
  import("./local-delivery").then((m) => m.ArpFan),
);
export const ArpSim = dynamic(() =>
  import("./local-delivery").then((m) => m.ArpSim),
);
export const HopExplorer = dynamic(() =>
  import("./local-delivery").then((m) => m.HopExplorer),
);
export const NatLookup = dynamic(() =>
  import("./local-delivery").then((m) => m.NatLookup),
);
export const OfficeMap = dynamic(() =>
  import("./office").then((m) => m.OfficeMap),
);
export const LayerQuiz = dynamic(() =>
  import("./quiz").then((m) => m.LayerQuiz),
);
export const Envelope = dynamic(() =>
  import("./request-trip").then((m) => m.Envelope),
);
export const Journey = dynamic(() =>
  import("./request-trip").then((m) => m.Journey),
);
export const LatCalc = dynamic(() =>
  import("./routing").then((m) => m.LatCalc),
);
export const LpmBits = dynamic(() =>
  import("./routing").then((m) => m.LpmBits),
);
export const LpmTool = dynamic(() =>
  import("./routing").then((m) => m.LpmTool),
);
export const RouteHops = dynamic(() =>
  import("./routing").then((m) => m.RouteHops),
);
export const TraceSim = dynamic(() =>
  import("./routing").then((m) => m.TraceSim),
);
export const SameNet = dynamic(() =>
  import("./same-net").then((m) => m.SameNet),
);
export const SeqDiagram = dynamic(() =>
  import("./seq").then((m) => m.SeqDiagram),
);
export const SeqSimulator = dynamic(() =>
  import("./seq").then((m) => m.SeqSimulator),
);
export const SeqToggle = dynamic(() =>
  import("./seq").then((m) => m.SeqToggle),
);
export const TcpLife = dynamic(() => import("./seq").then((m) => m.TcpLife));
export const CorsSim = dynamic(() =>
  import("./setup-security").then((m) => m.CorsSim),
);
export const DoraInspect = dynamic(() =>
  import("./setup-security").then((m) => m.DoraInspect),
);
export const LeaseSim = dynamic(() =>
  import("./setup-security").then((m) => m.LeaseSim),
);
export const NtpCalc = dynamic(() =>
  import("./setup-security").then((m) => m.NtpCalc),
);
export const OriginCmp = dynamic(() =>
  import("./setup-security").then((m) => m.OriginCmp),
);
export const TunnelBuilder = dynamic(() =>
  import("./setup-security").then((m) => m.TunnelBuilder),
);
export const BdpCalc = dynamic(() =>
  import("./transport").then((m) => m.BdpCalc),
);
export const MssCalc = dynamic(() =>
  import("./transport").then((m) => m.MssCalc),
);
export const SlideWin = dynamic(() =>
  import("./transport").then((m) => m.SlideWin),
);
export const UdpSim = dynamic(() =>
  import("./transport").then((m) => m.UdpSim),
);
export const CertSim = dynamic(() => import("./web").then((m) => m.CertSim));
export const DhCalc = dynamic(() => import("./web").then((m) => m.DhCalc));
export const RtSim = dynamic(() => import("./web").then((m) => m.RtSim));
export const Waterfall = dynamic(() =>
  import("./web").then((m) => m.Waterfall),
);
export const WsDump = dynamic(() => import("./web").then((m) => m.WsDump));
export const WsHeader = dynamic(() => import("./web").then((m) => m.WsHeader));
