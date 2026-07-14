### Fix: Site dead after enabling HTTPS (firewall blocking port 443)
- **Problem**: Right after setting up HTTPS with certbot, `yankpaste.xyz` stopped loading from the outside, even though everything worked
 fine when tested on the server itself (`curl https://localhost -H "Host: yankpaste.xyz"` returned `200`).
- **Cause**: The `ufw` firewall only allowed port 22 (SSH) and port 80 (HTTP) — there was **no rule for port 443**. Before HTTPS, the sit
e was served on port 80 (open), so it worked. After certbot, nginx started redirecting all port-80 traffic to HTTPS on port 443 (`return
301 https://...`). Since 443 was blocked by the firewall, outside visitors got redirected to a port they couldn't reach, so the site appe
ared down.
- **Solution**: Allow port 443 through the firewall by enabling the `Nginx Full` profile (covers both 80 and 443), then remove the now-re
dundant HTTP-only rule:
    ```
    sudo ufw allow 'Nginx Full'
    sudo ufw delete allow 'Nginx HTTP'
    sudo ufw status verbose   # should now show "80,443/tcp (Nginx Full)  ALLOW IN  Anywhere"
    ```
- **Note**: If the site is still unreachable after this, check for a cloud-provider firewall (e.g. AWS Security Group / Linode Cloud Fire
wall) and make sure it also allows inbound port 443.
