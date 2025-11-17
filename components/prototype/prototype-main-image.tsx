import Image from 'next/image';
import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';

type PrototypeMainImageProps = {
  prototype: Pick<Prototype, 'mainUrl' | 'prototypeNm'>;
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
};

export const PrototypeMainImage = ({
  prototype,
  maxHeight = 'md',
}: PrototypeMainImageProps) => {
  const imageUrl = (prototype.mainUrl ?? '').trim();
  const altText =
    (prototype.prototypeNm ?? '').trim() || 'Prototype main image';

  const heightClasses = {
    sm: 'max-h-48', // 192px
    md: 'max-h-64', // 256px
    lg: 'max-h-80', // 320px
    xl: 'max-h-96', // 384px
    none: '',
  };

  if (imageUrl.length === 0) {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-slate-400 p-3">
        <p className="text-sm text-slate-500">No main image available.</p>
      </div>
    );
  }

  return (
    <>
      <Image
        priority={true}
        src={imageUrl}
        alt={altText}
        width={600}
        height={400}
        className={`h-auto w-full rounded-lg border border-slate-200 object-cover ${heightClasses[maxHeight]}`}
      />
    </>
  );
};
