import AdmZip from "adm-zip";
import axios from "axios";

const url = "https://new.real.download.dws.co.kr/common/master/nasmst.cod.zip";

async function check() {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const zip = new AdmZip(Buffer.from(response.data));
  const zipEntries = zip.getEntries();
  console.log(
    "Files in zip:",
    zipEntries.map((e) => e.entryName),
  );
}

check();
