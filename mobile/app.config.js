module.exports = ({ config }) => {
  return {
    ...config,
    ios: {
      ...config.ios,
      // Use the EAS Secret file path if available, else fall back to local file
      googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST || "./GoogleService-Info.plist",
    },
    android: {
      ...config.android,
      // Use the EAS Secret file path if available, else fall back to local file
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
  };
};
