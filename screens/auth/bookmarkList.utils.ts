import { useState, useEffect } from "react";
import { BookmarkApi } from "../../libs/api";

export interface BookmarkItem {
  bookmarked: boolean | null;
  bookmarkId: number;
  productId: number;
  productName: string;
  productImgUrl: string;
  createdAt: string | null;
}

export const useBookmarkList = () => {
  const [bookmarkList, setBookmarkList] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarkList = async () => {
      try {
        const response = await BookmarkApi.getList();
        if (response.success && response.data) {
          setBookmarkList(response.data);
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

    fetchBookmarkList();
  }, []);

  return { bookmarkList, loading, error };
};
