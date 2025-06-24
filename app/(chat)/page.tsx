import BoundingBox from "@/components/bounding-box";
import { ImageUpload } from "@/components/image-upload";

export default function Page() {
  return (
    <>
      <ImageUpload />
      <BoundingBox width={200} height={100} />
    </>
  );
}
