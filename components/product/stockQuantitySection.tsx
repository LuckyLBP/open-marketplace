const StockQuantitySection = ({ inStock, stockQuantity, t }: { inStock?: boolean; stockQuantity?: number; t: any }) => {
  return (
    <div className="flex items-center mb-4">
      {inStock ? (
        <div className="flex items-center text-green-600">
          <span className="font-medium">
            {t('In Stock')} ({stockQuantity ?? 0} {t('available')})
          </span>
        </div>
      ) : (
        <div className="text-red-600 font-medium">{t('Out of Stock')}</div>
      )}
    </div>
  );
};

export default StockQuantitySection;