import { useState, useEffect } from "react";
import { BookmarkApi } from "../../libs/api";

interface BookmarkItem {
  bookmarked: boolean | null;
  bookmarkId: number;
  productId: number;
  productName: string;
  productImgUrl: string;
  createdAt: string | null;
}

export const useBookmarklist = () => {
  const [bookmarklist, setBookmarklist] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarklist = async () => {
      try {
        const response = await BookmarkApi.getList();
        if (response.success && response.data) {
          setBookmarklist(response.data); // data is now the array
        } else {
          setError(response.message || "찜 목록을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("찜 목록을 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarklist();
  }, []);

  return { bookmarklist, loading, error };
};

export { BookmarkItem };
