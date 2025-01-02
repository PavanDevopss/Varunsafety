const { Client } = require("ssh2");
const fs = require("fs");

// Function to upload image to remote server via SSH
const transferImageToServer = async (
  localFilePath,
  remoteFilePath,
  sshConfig,
  action
) => {
  const { host, port, username, privateKeyPath } = sshConfig;
  const privateKey = fs.readFileSync(privateKeyPath);

  const sshClient = new Client();

  return new Promise((resolve, reject) => {
    sshClient.on("ready", () => {
      sshClient.sftp(async (err, sftp) => {
        if (err) {
          sshClient.end();
          return reject(err);
        }

        // Ensure remoteFilePath is not null or undefined
        if (!remoteFilePath) {
          sshClient.end();
          return reject(new Error("remoteFilePath is null or undefined"));
        }

        // Replace backslashes with forward slashes in the remoteFilePath
        remoteFilePath = remoteFilePath.replace(/\\/g, "/");

        if (action === "upload") {
          sftp.fastPut(localFilePath, remoteFilePath, (err) => {
            if (err) {
              sshClient.end();
              return reject(err);
            } else {
              sshClient.end();
              return resolve();
            }
          });
        } else if (action === "remove") {
          sftp.unlink(remoteFilePath, (err) => {
            if (err) {
              // Check for "No such file" error
              if (err.code === 2) {
                console.log(`File not found: ${remoteFilePath}`);
                sshClient.end();
                return resolve(`File not found: ${remoteFilePath}`);
              } else {
                sshClient.end();
                return reject(err);
              }
            } else {
              sshClient.end();
              return resolve();
            }
          });
        } else {
          sshClient.end();
          return reject(new Error("Invalid action specified"));
        }
      });
    });

    sshClient.on("error", (err) => {
      sshClient.end();
      return reject(err);
    });

    sshClient.connect({
      host: host,
      port: port,
      username: username,
      privateKey: privateKey,
    });
  });
};

module.exports = {
  transferImageToServer,
};
