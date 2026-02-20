import { useState, useEffect } from "react";
import { ReviewApi, MyReviewItem } from "../../libs/api";

export const useMyReviews = () => {
  const [myReviews, setMyReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const response = await ReviewApi.getMyReviews();
        if (response.success && response.data) {
          setMyReviews(response.data);
        } else {
          setError(response.message || "내가 작성한 리뷰를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("내가 작성한 리뷰를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  return { myReviews, loading, error };
};
