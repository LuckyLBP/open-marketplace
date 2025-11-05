'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: 'header' | 'sidebar' | 'footer' | 'inline';
  createdAt: Date;
  updatedAt: Date;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    isActive: true,
    position: 'header' as Banner['position'],
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchBanners = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'banners'), orderBy('createdAt', 'desc'))
      );
      const bannersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Banner[];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Clear the imageUrl when a new file is selected
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload new file if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const bannerData = {
        ...formData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), {
          ...bannerData,
          updatedAt: new Date(),
        });
        setBanners((prev) =>
          prev.map((banner) =>
            banner.id === editingBanner.id
              ? { ...banner, ...bannerData }
              : banner
          )
        );
      } else {
        const docRef = await addDoc(collection(db, 'banners'), bannerData);
        setBanners((prev) => [{ id: docRef.id, ...bannerData }, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl,
      isActive: banner.isActive,
      position: banner.position,
    });
    setShowForm(true);
  };

  const handleDelete = async (bannerId: string) => {
    if (confirm('Är du säker på att du vill ta bort denna banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', bannerId));
        setBanners((prev) => prev.filter((banner) => banner.id !== bannerId));
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      targetUrl: '',
      isActive: true,
      position: 'header',
    });
    setEditingBanner(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(false);
  };

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        isActive: !banner.isActive,
        updatedAt: new Date(),
      });
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, isActive: !b.isActive } : b
        )
      );
    } catch (error) {
      console.error('Error updating banner status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Bannerhantering
          </h3>
          <p className="text-sm text-gray-600">
            Hantera banners och deras associerade URL:er på plattformen
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Lägg till ny banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {editingBanner ? 'Redigera banner' : 'Lägg till ny banner'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bannertitel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ange bannertitel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      position: e.target.value as Banner['position'],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="header">Huvud</option>
                  <option value="sidebar">Sidofält</option>
                  <option value="footer">Sidfot</option>
                  <option value="inline">Inbäddad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bannerbild
              </label>
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rekommenderad storlek: 1920 x 600px (JPG, PNG, GIF, WebP)
                  </p>
                </div>

                {selectedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Vald fil:</strong> {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Storlek: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/banner-image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Eller ange en bild-URL direkt
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {(previewUrl || formData.imageUrl) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Förhandsvisning
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        Bannerförhandsvisning
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {formData.position}
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-lg shadow-sm bg-white">
                      <img
                        src={previewUrl || formData.imageUrl}
                        alt={formData.title || 'Banner preview'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.jpg';
                        }}
                      />
                      {formData.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <h3 className="text-white font-medium text-sm">
                            {formData.title}
                          </h3>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <strong>Mål-URL:</strong>{' '}
                        {formData.targetUrl || 'Inte angiven'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {formData.isActive ? 'Aktiv' : 'Inaktiv'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mål-URL
              </label>
              <input
                type="url"
                value={formData.targetUrl}
                onChange={(e) =>
                  setFormData({ ...formData, targetUrl: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/target-page"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Aktiv (synlig på webbplatsen)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !formData.imageUrl)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {uploading
                  ? 'Laddar upp...'
                  : editingBanner
                  ? 'Uppdatera banner'
                  : 'Skapa banner'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">
            Banners ({banners.length})
          </h4>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              Inga banners hittades. Skapa din första banner ovan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <div key={banner.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-medium text-gray-900">
                        {banner.title}
                      </h5>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {banner.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {banner.position}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Förhandsvisning:
                        </p>
                        <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bild-URL:</p>
                        <p className="text-sm text-gray-900 break-all">
                          {banner.imageUrl}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mål-URL:</p>
                        <a
                          href={banner.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 break-all"
                        >
                          {banner.targetUrl}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Skapad: {banner.createdAt.toLocaleDateString('sv-SE')}
                      </span>
                      <span>
                        Uppdaterad:{' '}
                        {banner.updatedAt.toLocaleDateString('sv-SE')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setFormData({
                          title: banner.title,
                          imageUrl: banner.imageUrl,
                          targetUrl: banner.targetUrl,
                          isActive: banner.isActive,
                          position: banner.position,
                        });
                        setPreviewUrl(banner.imageUrl);
                        setShowForm(true);
                      }}
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Förhandsvisa
                    </button>
                    <button
                      onClick={() => toggleBannerStatus(banner)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                        banner.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {banner.isActive ? 'Inaktivera' : 'Aktivera'}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
