### Add documentation for firmware code here

# Install beta components:
`gcloud components install beta`
# Authenticate with Google Cloud:
`gcloud auth login`
# Create cloud project — choose your unique project name:
`gcloud projects create keypark-backend`
# Set current project
`gcloud config set project keypark-backend`



# Add permissions for IoT Core
`gcloud projects add-iam-policy-binding keypark-backend --member=serviceAccount:cloud-iot@system.gserviceaccount.com --role=roles/pubsub.publisher`
# Create PubSub topic for device data:
`gcloud beta pubsub topics create telemetry-topic`
# Create PubSub subscription for device data:
`gcloud beta pubsub subscriptions create --topic telemetry-topic telemetry-subscription`
# Create device registry:
`gcloud beta iot registries create asset-tracker-registry --region europe-west1 --event-pubsub-topic=telemetry-topic`



#Flash device
`mos build --arch esp32`
`mos flash`



#Run the following command to register this device on Cloud IoT Code. The command generates a public and a private key to be used for the communication, put the private key on the device, send the public key to Cloud IoT core and register the device, getting the deviceId from ESP. 
`mos gcp-iot-setup --gcp-project keypark-backend --gcp-region europe-west1 --gcp-registry telemetry-topic`
