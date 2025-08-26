const StockQuantitySection = ({
  inStock,
  stockQuantity,
  t,
}: {
  inStock?: boolean;
  stockQuantity?: number;
  t: any;
}) => {
  return (
    <div className="mb-4">
      {inStock ? (
        <div className="inline-flex items-center rounded-full bg-green-50 text-green-800 px-3 py-1 text-sm font-medium">
          {t('I lager')} • {stockQuantity ?? 0} {t('kvar')}
        </div>
      ) : (
        <div className="inline-flex items-center rounded-full bg-red-50 text-red-800 px-3 py-1 text-sm font-medium">
          {t('Slut i lager')}
        </div>
      )}
    </div>
  );
};

export default StockQuantitySection;
