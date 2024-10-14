const defaultSettings: Record<string, any> = {
    "SERVER_PORT": 23315,
    "MONGODB_URL": "mongodb://localhost:27017"
};

const envKeys = Object.keys(process.env);
for (const key in defaultSettings) {
    if (!envKeys.includes(key)) {
        process.env[key] = defaultSettings[key]
    }
}
