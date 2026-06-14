import { useAdminCategories } from './AdminCategories/hooks/useAdminCategories';
import { AdminCategoriesHeader } from './AdminCategories/components/AdminCategoriesHeader';
import { CategoryGrid } from './AdminCategories/components/CategoryGrid';
import { CategoryFormModal } from './AdminCategories/components/CategoryFormModal';

export default function AdminCategories() {
  const {
    categories,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    selectedCategory,
    isBulkLoading,
    handleBulkLoad,
    formData,
    setFormData,
    saveMutation,
    toggleMutation,
    deleteMutation,
    openModal
  } = useAdminCategories();

  if (isLoading) return <div className="p-8 text-white">Yuklanmoqda...</div>;

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto animate-fade-in h-full overflow-y-auto">
      <AdminCategoriesHeader 
        isBulkLoading={isBulkLoading}
        handleBulkLoad={handleBulkLoad}
        openModal={openModal}
      />

      <CategoryGrid 
        categories={categories}
        toggleMutation={toggleMutation}
        deleteMutation={deleteMutation}
        openModal={openModal}
      />

      <CategoryFormModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedCategory={selectedCategory}
        formData={formData}
        setFormData={setFormData}
        saveMutation={saveMutation}
      />
    </div>
  );
}
