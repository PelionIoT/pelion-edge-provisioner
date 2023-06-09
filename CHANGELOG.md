# Release notes

## Izuma Edge provisioner v2.7.0

- Izuma branding (Pelion -> Izuma Networks) and related URL changes.

## Pelion Edge provisioner v2.6.0

### Bug fixes
- Upgraded the docker base image from Bionic to Focal and fixed the compatibility issues with latest FCU v1.2.15. This resolves the error `cbor2-5.2.0- UnicodeDecodeError: ascii codec can't decode byte` caused when executing the docker build step.
- Upgraded the docker image's node version to 14.x LTS.

## Pelion Edge provisioner v2.5.1

### Features
- Added execute permissions to install scripts.

## Pelion Edge provisioner v2.5.0

### Features
- Fixed Readme link to point to latest version.
- Removed the generation of self-signed certificate as gateway services authenticate using device's LwM2M certificate.

## Pelion Edge provisioner v2.4.0

### Features
- Created new example script to install Pelion Edge credentials on Parsec + TPM enabled builds.
- Updated installation commands to work with latest version of Factory Configurator Utility (FCU).

## Pelion Edge provisioner v2.3.0

### Features
- Allows gateways to setup Journald's Forward Secure Sealing (FSS) feature. When creating gateway identity using `get-one-identity` provide `-k` command line flag to also generate FSS sealing key which is used by `journald` to perform periodic cryptographic operation on the log data. The output of that operation also generates a verfication key which is then exported and saved in the pep API server database. To know more about the Journald FSS feature, refer [this article](https://lwn.net/Articles/512895/).
- Added `GET /v3/verification-key` REST API to read FSS verification key of a dispatched gateway.
- Added `get-verification-key` command to pep command-line interface (CLI).
- By default, the FSS_INTERVAL is set to 10 seconds. To change it add `-e <interval>` to `get-one-identity` command.

### Out of scope
- Gateway provisioning in developer mode.
- Injection of identity certificates and configuration information over IP only.
- You must use FCU to sign your device certificates (setting `device-key-generation-mode` parameter to `externally_supplied` in fcu.yml is not supported).
- You must provision gateways in first to claim mode only (setting `first-to-claim` parameter to `false` in fcu.yml is not supported).
- You must provide the PEP_SERVER_URL env variable manually as part of the CLI commands. Auto-discovery of the IP address of the machine running the pep API server is not supported.

## Pelion Edge provisioner v2.2.0

### Additions
- Added `GET /enrollment-ids` REST API to export enrollment identites of the dispatched gateways.
- Added `list-enrollment-ids` command to pep command-line interface (CLI).
- Added URL encoding to REST API parameters, which can contain reserve characters.

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
- The gateway initiates certificate injection, instead of [Factory Configurator Utility (FCU)](https://developer.izumanetworks.com/docs/device-management/current/provisioning-process/index.html), which initiates the injection in the [default Device Management provisioning flow](https://developer.izumanetworks.com/docs/device-management/current/provisioning-process/index.html).
- The Izuma Edge provisioning (pep) tool records the enrollment identity and configuration information of all provisioned gateways.
- Integrates default Izuma Device Management provisioning tools - Factory Configurator Utility (FCU) and Factory Configurator Client (FCC).
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
