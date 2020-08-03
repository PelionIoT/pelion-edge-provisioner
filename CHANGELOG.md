# Release notes

## Pelion Edge provisioner v2.2.0

### Additions
- Added `GET /enrollment-ids` REST API to export enrollment identites of the dispatched gateways.
- Added `list-enrollment-ids` command to pep command-line interface (CLI).
- Addded URL encoding to REST API parameters, which can contain reserve characters.

### Bug fix
If Factory Configurator Utility (FCU) fails to provision the gateway, the identity is not saved in the database or marked as deployed, which allows the user to re-request the identity with the same serial number.

### Out of scope
- Gateway provisioning in developer mode.
- Injection of identity certificates and configuration information over IP only.
- You must use FCU to sign your device certificates (setting `device-key-generation-mode` parameter to `externally_supplied` in fcu.yml is not supported).
- You must provision gateways in first to claim mode only (setting `first-to-claim` parameter to `false` in fcu.yml is not supported).
- You must provide the PEP_SERVER_URL env variable manually as part of the CLI commands. Auto-discovery of the IP address of the machine running the pep API server is not supported.

## Pelion Edge provisioner v2.1.0

### Additions
- The gateway initiates certificate injection, instead of [Factory Configurator Utility (FCU)](https://www.pelion.com/docs/device-management/current/provisioning-process/index.html), which initiates the injection in the [default Device Management provisioning flow](https://www.pelion.com/docs/device-management/current/provisioning-process/index.html).
- The Pelion Edge provisioning (pep) tool records the enrollment identity and configuration information of all provisioned gateways.
- Integrates default Pelion Device Management provisioning tools - Factory Configurator Utility (FCU) and Factory Configurator Client (FCC).
- Gateway provisioning in production mode.
- Pep API server hosts REST calls:
	- `GET /identity` to create and dispatch new gateway identities.
	- `GET /enrollment-id` to get the enrollment identity of the dispatched gateway.
- Provides pep command-line interface (CLI), a command-line tool that interacts with the pep API server using cURL.

### Out of scope
- Gateway provisioning in developer mode.
- Injection of identity certificates and configuration information over IP only.
- You must use FCU to sign your device certificates (setting `device-key-generation-mode` parameter to `externally_supplied` in fcu.yml is not supported).
- You must provision gateways in first to claim mode only (setting `first-to-claim` parameter to `false` in fcu.yml is not supported).
- You must provide the PEP_SERVER_URL env variable manually as part of the CLI commands. Auto-discovery of the IP address of the machine running the pep API server is not supported.
