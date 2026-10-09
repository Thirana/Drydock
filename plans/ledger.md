# Migration ledger

Generated from the two source files on 2026-10-05. One row per chapter. Tick a chapter only when its prose, every diagram, every table and every widget listed here render on the new page. Step 7 deletes the sources only when every box is ticked.

Slugs are proposals; change them here before Step 3 and keep this file as the source of truth.

## Networking fundamentals (`/learn/fundamentals`)


### Part 0 - Start here

- [x] **0. The Kadé scenario** - `the-kade-scenario` - 751 words, 1 SVG, 2 tables, 0 code blocks. Widgets: none

### Part 1 - Addressing and local delivery

- [x] **1. How a request leaves your laptop** - `how-a-request-leaves-your-laptop` - 2430 words, 9 SVG, 2 tables, 1 code blocks. Widgets: `journey` x2, `hexline`, `hexdump`, `envelope` x3
- [x] **2. IP addresses (IPv4)** - `ip-addresses-ipv4` - 1340 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `ipanatomy`, `placevalue`, `ipconv`
- [x] **3. Networks, hosts and CIDR** - `networks-hosts-and-cidr` - 1627 words, 3 SVG, 3 tables, 0 code blocks. Widgets: `cidrbar`, `vpcslots`, `cidrcalc`
- [x] **4. Subnet masks** - `subnet-masks` - 1165 words, 1 SVG, 3 tables, 0 code blocks. Widgets: `cidrbar`, `andgrid` x3, `samenet`
- [x] **5. The default gateway** - `the-default-gateway` - 1276 words, 2 SVG, 3 tables, 0 code blocks. Widgets: none
- [x] **6. Putting it together** - `putting-it-together` - 948 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `officemap` x5
- [x] **7. MAC addresses** - `mac-addresses` - 1268 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `hexgrid`, `macanatomy`, `macdecode`
- [x] **8. MAC vs IP: why we need both** - `mac-vs-ip-why-we-need-both` - 746 words, 1 SVG, 2 tables, 0 code blocks. Widgets: `sizecompare`, `hopexplorer`
- [x] **9. ARP: from IP to MAC** - `arp-from-ip-to-mac` - 1119 words, 0 SVG, 2 tables, 0 code blocks. Widgets: `arpfan` x2, `arpsim`
- [x] **10. NAT: sharing one public IP** - `nat-sharing-one-public-ip` - 2979 words, 4 SVG, 7 tables, 0 code blocks. Widgets: `natlookup`

### Part 2 - Layers, routing and transport

- [x] **11. TCP/IP & OSI models** - `tcp-ip-osi-models` - 1430 words, 2 SVG, 5 tables, 0 code blocks. Widgets: `layerquiz`
- [x] **12. How routing works (in depth)** - `how-routing-works-in-depth` - 2846 words, 4 SVG, 8 tables, 0 code blocks. Widgets: `routehops`, `lpmbits`, `lpmtool`, `ipv4hdr`, `ipv4dump`, `latcalc`
- [x] **13. ICMP: ping & traceroute** - `icmp-ping-traceroute` - 1744 words, 1 SVG, 4 tables, 3 code blocks. Widgets: `tracesim`
- [x] **14. UDP: the fast protocol** - `udp-the-fast-protocol` - 1634 words, 1 SVG, 4 tables, 0 code blocks. Widgets: `udpsim`
- [x] **15. Anatomy of a UDP datagram** - `anatomy-of-a-udp-datagram` - 1237 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `udphdr`, `udpdump`, `udpbuild`
- [x] **16. TCP: the reliable backbone** - `tcp-the-reliable-backbone` - 1651 words, 1 SVG, 5 tables, 0 code blocks. Widgets: `seqdiag` x2, `tcplife`
- [x] **17. TCP sequence & ACK numbers** - `tcp-sequence-ack-numbers` - 1205 words, 0 SVG, 2 tables, 0 code blocks. Widgets: `seqdiag`, `seqsim`
- [x] **18. TCP segment, MTU, MSS & fragmentation** - `tcp-segment-mtu-mss-fragmentation` - 1989 words, 0 SVG, 7 tables, 0 code blocks. Widgets: `tcphdr`, `syndump`, `msscalc`, `seqdiag`
- [x] **19. TCP flow control** - `tcp-flow-control` - 1251 words, 1 SVG, 2 tables, 2 code blocks. Widgets: `slidewin`, `bdpcalc`, `seqdiag`
- [x] **20. TCP congestion control** - `tcp-congestion-control` - 1593 words, 1 SVG, 3 tables, 0 code blocks. Widgets: `chart` x5, `cwndsim`
- [x] **21. Sockets, Nagle & keepalives: TCP from your code** - `sockets-nagle-keepalives-tcp-from-your-code` - 1775 words, 1 SVG, 5 tables, 4 code blocks. Widgets: `seqtoggle`

### Part 3 - Application protocols

- [x] **22. DNS: how resolution works** - `dns-how-resolution-works` - 2189 words, 1 SVG, 6 tables, 0 code blocks. Widgets: `dnswalk`, `dnssim`
- [x] **23. DNS records & email security** - `dns-records-email-security` - 2183 words, 0 SVG, 4 tables, 4 code blocks. Widgets: `mxflow`, `dkimflow`, `mailsim`
- [x] **24. HTTP & its versions** - `http-its-versions` - 1991 words, 0 SVG, 6 tables, 2 code blocks. Widgets: `waterfall`
- [x] **25. TLS & HTTPS** - `tls-https` - 2645 words, 1 SVG, 8 tables, 0 code blocks. Widgets: `dhcalc`, `seqdiag` x2, `certsim`
- [x] **26. WebSockets** - `websockets` - 1801 words, 1 SVG, 6 tables, 3 code blocks. Widgets: `rtsim`, `seqdiag` x2, `wshdr`, `wsdump`
- [x] **27. DHCP in depth** - `dhcp-in-depth` - 1934 words, 1 SVG, 7 tables, 0 code blocks. Widgets: `dorainspect`, `leasesim`, `ntpcalc`
- [x] **28. Same-origin policy & CORS** - `same-origin-policy-cors` - 1830 words, 0 SVG, 7 tables, 3 code blocks. Widgets: `origincmp`, `seqdiag` x2, `corssim`
- [x] **29. SSH & tunnels** - `ssh-tunnels` - 1886 words, 1 SVG, 6 tables, 5 code blocks. Widgets: `seqdiag` x2, `tunnelbuilder`

### Part 4 - Network building blocks

- [x] **30. IPv6** - `ipv6` - 1945 words, 0 SVG, 6 tables, 1 code blocks. Widgets: `v6tool`, `seqdiag`, `euitool`, `v6hdr`
- [x] **31. Ports & sockets** - `ports-sockets` - 1497 words, 1 SVG, 6 tables, 0 code blocks. Widgets: `bindsim`
- [x] **32. Hubs, switches & routers** - `hubs-switches-routers` - 1691 words, 2 SVG, 5 tables, 0 code blocks. Widgets: `netsim`

### Part 5 - Putting it together

- [x] **33. Proxies, reverse proxies & load balancers** - `proxies-reverse-proxies-load-balancers` - 3736 words, 3 SVG, 13 tables, 2 code blocks. Widgets: `connectflow`, `lbsim`, `xffsim`, `timeoutchain`
- [x] **34. Capstone: opening api.kade.lk** - `capstone-opening-api-kade-lk` - 1807 words, 0 SVG, 9 tables, 1 code blocks. Widgets: `joinflow`, `e2ejourney`, `e2emodel`, `curltime`

Unique widgets in this course: 74

## Networking on GCP (`/learn/gcp`)


### Part 0 - Start here

- [x] **0. Kadé on GCP** - `kade-on-gcp` - 3784 words, 3 SVG, 9 tables, 13 code blocks. Widgets: `addrfind`

### Part 1 - Foundations

- [x] **1. The mental model: Andromeda, no layer 2** - `the-mental-model-andromeda-no-layer-2` - 3655 words, 3 SVG, 10 tables, 12 code blocks. Widgets: `pktwalk`, `scopequiz`
- [x] **2. VPC networks and subnets** - `vpc-networks-and-subnets` - 3420 words, 2 SVG, 14 tables, 11 code blocks. Widgets: `subnetgrid`, `expcheck`
- [x] **3. IP addressing** - `ip-addressing` - 2932 words, 2 SVG, 10 tables, 13 code blocks. Widgets: `ipfate`
- [x] **4. Routing** - `routing` - 3065 words, 1 SVG, 8 tables, 13 code blocks. Widgets: `routeex`, `routepick`

### Part 2 - Controlling access

- [x] **5.1. Firewall 1: VPC firewall rules** - `firewall-vpc-firewall-rules` - 2537 words, 1 SVG, 6 tables, 18 code blocks. Widgets: `statefulex`, `ruleex`, `fwwalk`
- [x] **5.2. Firewall 2: firewall policies** - `firewall-firewall-policies` - 1883 words, 1 SVG, 7 tables, 7 code blocks. Widgets: `layerex`, `layerwalk`, `objex`
- [x] **6.1. Admin access 1: IAP TCP forwarding** - `admin-access-iap-tcp-forwarding` - 2330 words, 1 SVG, 6 tables, 17 code blocks. Widgets: `sshcheck`
- [x] **6.2. Admin access 2: OS Login and no external IPs** - `admin-access-os-login-and-no-external-ips` - 1718 words, 2 SVG, 4 tables, 9 code blocks. Widgets: `sshcheck`

### Part 3 - Leaving and reaching privately

- [x] **7. Egress and Cloud NAT** - `egress-and-cloud-nat` - 2659 words, 1 SVG, 10 tables, 15 code blocks. Widgets: `natcalc`
- [x] **8. DNS inside GCP** - `dns-inside-gcp` - 2362 words, 1 SVG, 8 tables, 12 code blocks. Widgets: `dnsorder`, `splitex`, `dnswalk`, `ttlex`, `dnshybrid`
- [x] **9. Private access to Google services** - `private-access-to-google-services` - 2187 words, 0 SVG, 8 tables, 9 code blocks. Widgets: `privoverview`, `pgaex`, `psaex`, `pscex`, `sqlcutover`
- [x] **10. Serverless networking: Cloud Run** - `serverless-networking-cloud-run` - 2096 words, 0 SVG, 7 tables, 12 code blocks. Widgets: `runpaths`

### Part 4 - The front door

- [x] **11. Load balancing 1: the family and how to choose** - `load-balancing-the-family-and-how-to-choose` - 1433 words, 0 SVG, 7 tables, 3 code blocks. Widgets: `lbdecoder`, `lbglobal`, `lbl7l4`, `proxyex`, `lbtree`
- [x] **12.1. Load balancing 2: inside the HTTPS load balancer** - `load-balancing-inside-the-https-load-balancer` - 2478 words, 0 SVG, 11 tables, 10 code blocks. Widgets: `lbchain`, `urlmaptool`, `hcex`, `deployex`, `xffex`, `armorex`
- [x] **12.2. Load balancing 3: VMs behind the load balancer** - `load-balancing-vms-behind-the-load-balancer` - 2336 words, 0 SVG, 11 tables, 9 code blocks. Widgets: `migoverview`, `healex`, `scaleex`, `updateex`, `migchain`
- [x] **13. Cloudflare and GCP** - `cloudflare-and-gcp` - 2680 words, 0 SVG, 11 tables, 7 code blocks. Widgets: `cfoverview`, `cfmigrate`, `cfrecords`, `tlsmodes`, `originlock`, `cfcache`, `cferrors`

### Part 5 - Growing out

- [x] **14. A second VPC, briefly** - `a-second-vpc-briefly` - 1710 words, 1 SVG, 5 tables, 5 code blocks. Widgets: `vpcoptions`, `peeringex`, `sharedvpc`
- [x] **15. Hybrid: VPN and Interconnect** - `hybrid-vpn-and-interconnect` - 1956 words, 0 SVG, 7 tables, 7 code blocks. Widgets: `hybridpaths`, `vpnparts`, `bgpex`, `failoverex`, `mtubar`, `vpnflows`

### Part 6 - Running it

- [x] **16.1. Observability 1: what each log can tell you** - `observability-what-each-log-can-tell-you` - 1965 words, 0 SVG, 7 tables, 7 code blocks. Widgets: `obsmap`, `lbentry`, `flowcover`, `logcost`, `querybook`
- [x] **16.2. Observability 2: monitoring, alerting and troubleshooting** - `observability-monitoring-alerting-and-troubleshooting` - 1606 words, 0 SVG, 5 tables, 6 code blocks. Widgets: `dashmock`, `uptimeex`, `alertwin`, `conntest`, `incidents`, `rollout`
- [x] **17. Governance: keeping it fixed** - `governance-keeping-it-fixed` - 2289 words, 0 SVG, 8 tables, 8 code blocks. Widgets: `driftmodel`, `govhier`, `orgpolex`, `constraints`, `guardrails`, `iamflow`, `vpcscex`, `iacflow`, `govrollout`
- [x] **18.1. Capstone 1: a photo, through a VM to the database** - `capstone-a-photo-through-a-vm-to-the-database` - 535 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `cap1`, `quiz1`
- [x] **18.2. Capstone 2: a payment, through Cloud Run to PayGate** - `capstone-a-payment-through-cloud-run-to-paygate` - 602 words, 0 SVG, 3 tables, 0 code blocks. Widgets: `cap2`, `finalmap`, `quiz2`

Unique widgets in this course: 84

