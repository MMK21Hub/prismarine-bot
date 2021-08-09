import { plugin } from "../index"

const ping: plugin = {
  metadata: {
    enabledByDefault: true,
    scopes: ["script"],
    pluginFormat: 1,
  },
}

export default ping
