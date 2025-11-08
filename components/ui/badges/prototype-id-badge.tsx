import { SimpleBadge, SimpleBadgeProps } from '@/components/ui/badges/simple-badge';

export type PrototypeIdBadgeProps = {
  id: number;
  size?: SimpleBadgeProps['size'];
};

export const PrototypeIdBadge = ({ id, size = 'responsive' }: PrototypeIdBadgeProps) => {
  return (
    <SimpleBadge
      label={String(id)}
      size={size}
      nowrap={true}
      tooltip={`Prototype ID: ${id}`}
      className="rounded-md text-lg tracking-widest"
    />
  );
};
