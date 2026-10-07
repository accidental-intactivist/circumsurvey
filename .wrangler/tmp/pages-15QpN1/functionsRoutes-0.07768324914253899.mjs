import { onRequestPost as __api_cms_bulk_match_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\cms\\bulk-match.js"
import { onRequestGet as __api_cms_pending_ocr_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\cms\\pending-ocr.js"
import { onRequestPost as __api_cms_process_ocr_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\cms\\process-ocr.js"
import { onRequestPost as __api_cms_save_ocr_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\cms\\save-ocr.js"
import { onRequestPost as __api_entities_merge_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\entities\\merge.js"
import { onRequestPost as __api_translations_approve_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\translations\\approve.js"
import { onRequestGet as __api_translations_hopper_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\translations\\hopper.js"
import { onRequestPost as __api_translations_request_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\translations\\request.js"
import { onRequestDelete as __api_cms__id__js_onRequestDelete } from "C:\\work\\circumsurvey\\functions\\api\\cms\\[id].js"
import { onRequestGet as __api_cms__id__js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\cms\\[id].js"
import { onRequestPut as __api_cms__id__js_onRequestPut } from "C:\\work\\circumsurvey\\functions\\api\\cms\\[id].js"
import { onRequestGet as __api_collections__slug__js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\collections\\[slug].js"
import { onRequestDelete as __api_entities__id__js_onRequestDelete } from "C:\\work\\circumsurvey\\functions\\api\\entities\\[id].js"
import { onRequestPut as __api_ingestion__id__js_onRequestPut } from "C:\\work\\circumsurvey\\functions\\api\\ingestion\\[id].js"
import { onRequestPut as __api_nominations__id__js_onRequestPut } from "C:\\work\\circumsurvey\\functions\\api\\nominations\\[id].js"
import { onRequestGet as __api_translations__docId__js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\translations\\[docId].js"
import { onRequestGet as __api_assets___path___js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\assets\\[[path]].js"
import { onRequestPost as __api_chat_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\chat.js"
import { onRequestGet as __api_cms_index_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\cms\\index.js"
import { onRequestPost as __api_cms_index_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\cms\\index.js"
import { onRequestGet as __api_collections_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\collections.js"
import { onRequestGet as __api_comments_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\comments.js"
import { onRequestPost as __api_comments_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\comments.js"
import { onRequestPut as __api_comments_js_onRequestPut } from "C:\\work\\circumsurvey\\functions\\api\\comments.js"
import { onRequestPost as __api_embed_text_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\embed_text.js"
import { onRequestGet as __api_entities_index_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\entities\\index.js"
import { onRequestPost as __api_entities_index_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\entities\\index.js"
import { onRequestPut as __api_entities_index_js_onRequestPut } from "C:\\work\\circumsurvey\\functions\\api\\entities\\index.js"
import { onRequestGet as __api_fix_dates_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\fix_dates.js"
import { onRequestGet as __api_ground_truth_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\ground-truth.js"
import { onRequestPost as __api_ground_truth_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\ground-truth.js"
import { onRequestPost as __api_ingest_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\ingest.js"
import { onRequestGet as __api_ingestion_index_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\ingestion\\index.js"
import { onRequestGet as __api_inventory_index_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\inventory\\index.js"
import { onRequestGet as __api_news_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\news.js"
import { onRequestGet as __api_nominations_index_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\nominations\\index.js"
import { onRequestPost as __api_nominations_index_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\nominations\\index.js"
import { onRequestPost as __api_semantic_search_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\semantic-search.js"
import { onRequestGet as __api_subjects_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\subjects.js"
import { onRequestPost as __api_submissions_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\submissions.js"
import { onRequestPost as __api_suggest_actions_js_onRequestPost } from "C:\\work\\circumsurvey\\functions\\api\\suggest-actions.js"
import { onRequestGet as __api_survey_stats_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\survey-stats.js"
import { onRequestGet as __api_test_js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\api\\test.js"
import { onRequest as __api_cron_daily_digest_js_onRequest } from "C:\\work\\circumsurvey\\functions\\api\\cron_daily_digest.js"
import { onRequest as __api_cron_news_ingest_js_onRequest } from "C:\\work\\circumsurvey\\functions\\api\\cron_news_ingest.js"
import { onRequest as __api_cron_social_ingest_js_onRequest } from "C:\\work\\circumsurvey\\functions\\api\\cron_social_ingest.js"
import { onRequestGet as ____path___js_onRequestGet } from "C:\\work\\circumsurvey\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/cms/bulk-match",
      mountPath: "/api/cms",
      method: "POST",
      middlewares: [],
      modules: [__api_cms_bulk_match_js_onRequestPost],
    },
  {
      routePath: "/api/cms/pending-ocr",
      mountPath: "/api/cms",
      method: "GET",
      middlewares: [],
      modules: [__api_cms_pending_ocr_js_onRequestGet],
    },
  {
      routePath: "/api/cms/process-ocr",
      mountPath: "/api/cms",
      method: "POST",
      middlewares: [],
      modules: [__api_cms_process_ocr_js_onRequestPost],
    },
  {
      routePath: "/api/cms/save-ocr",
      mountPath: "/api/cms",
      method: "POST",
      middlewares: [],
      modules: [__api_cms_save_ocr_js_onRequestPost],
    },
  {
      routePath: "/api/entities/merge",
      mountPath: "/api/entities",
      method: "POST",
      middlewares: [],
      modules: [__api_entities_merge_js_onRequestPost],
    },
  {
      routePath: "/api/translations/approve",
      mountPath: "/api/translations",
      method: "POST",
      middlewares: [],
      modules: [__api_translations_approve_js_onRequestPost],
    },
  {
      routePath: "/api/translations/hopper",
      mountPath: "/api/translations",
      method: "GET",
      middlewares: [],
      modules: [__api_translations_hopper_js_onRequestGet],
    },
  {
      routePath: "/api/translations/request",
      mountPath: "/api/translations",
      method: "POST",
      middlewares: [],
      modules: [__api_translations_request_js_onRequestPost],
    },
  {
      routePath: "/api/cms/:id",
      mountPath: "/api/cms",
      method: "DELETE",
      middlewares: [],
      modules: [__api_cms__id__js_onRequestDelete],
    },
  {
      routePath: "/api/cms/:id",
      mountPath: "/api/cms",
      method: "GET",
      middlewares: [],
      modules: [__api_cms__id__js_onRequestGet],
    },
  {
      routePath: "/api/cms/:id",
      mountPath: "/api/cms",
      method: "PUT",
      middlewares: [],
      modules: [__api_cms__id__js_onRequestPut],
    },
  {
      routePath: "/api/collections/:slug",
      mountPath: "/api/collections",
      method: "GET",
      middlewares: [],
      modules: [__api_collections__slug__js_onRequestGet],
    },
  {
      routePath: "/api/entities/:id",
      mountPath: "/api/entities",
      method: "DELETE",
      middlewares: [],
      modules: [__api_entities__id__js_onRequestDelete],
    },
  {
      routePath: "/api/ingestion/:id",
      mountPath: "/api/ingestion",
      method: "PUT",
      middlewares: [],
      modules: [__api_ingestion__id__js_onRequestPut],
    },
  {
      routePath: "/api/nominations/:id",
      mountPath: "/api/nominations",
      method: "PUT",
      middlewares: [],
      modules: [__api_nominations__id__js_onRequestPut],
    },
  {
      routePath: "/api/translations/:docId",
      mountPath: "/api/translations",
      method: "GET",
      middlewares: [],
      modules: [__api_translations__docId__js_onRequestGet],
    },
  {
      routePath: "/api/assets/:path*",
      mountPath: "/api/assets",
      method: "GET",
      middlewares: [],
      modules: [__api_assets___path___js_onRequestGet],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/cms",
      mountPath: "/api/cms",
      method: "GET",
      middlewares: [],
      modules: [__api_cms_index_js_onRequestGet],
    },
  {
      routePath: "/api/cms",
      mountPath: "/api/cms",
      method: "POST",
      middlewares: [],
      modules: [__api_cms_index_js_onRequestPost],
    },
  {
      routePath: "/api/collections",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_collections_js_onRequestGet],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_comments_js_onRequestGet],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_comments_js_onRequestPost],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_comments_js_onRequestPut],
    },
  {
      routePath: "/api/embed_text",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_embed_text_js_onRequestPost],
    },
  {
      routePath: "/api/entities",
      mountPath: "/api/entities",
      method: "GET",
      middlewares: [],
      modules: [__api_entities_index_js_onRequestGet],
    },
  {
      routePath: "/api/entities",
      mountPath: "/api/entities",
      method: "POST",
      middlewares: [],
      modules: [__api_entities_index_js_onRequestPost],
    },
  {
      routePath: "/api/entities",
      mountPath: "/api/entities",
      method: "PUT",
      middlewares: [],
      modules: [__api_entities_index_js_onRequestPut],
    },
  {
      routePath: "/api/fix_dates",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fix_dates_js_onRequestGet],
    },
  {
      routePath: "/api/ground-truth",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ground_truth_js_onRequestGet],
    },
  {
      routePath: "/api/ground-truth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_ground_truth_js_onRequestPost],
    },
  {
      routePath: "/api/ingest",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_ingest_js_onRequestPost],
    },
  {
      routePath: "/api/ingestion",
      mountPath: "/api/ingestion",
      method: "GET",
      middlewares: [],
      modules: [__api_ingestion_index_js_onRequestGet],
    },
  {
      routePath: "/api/inventory",
      mountPath: "/api/inventory",
      method: "GET",
      middlewares: [],
      modules: [__api_inventory_index_js_onRequestGet],
    },
  {
      routePath: "/api/news",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_news_js_onRequestGet],
    },
  {
      routePath: "/api/nominations",
      mountPath: "/api/nominations",
      method: "GET",
      middlewares: [],
      modules: [__api_nominations_index_js_onRequestGet],
    },
  {
      routePath: "/api/nominations",
      mountPath: "/api/nominations",
      method: "POST",
      middlewares: [],
      modules: [__api_nominations_index_js_onRequestPost],
    },
  {
      routePath: "/api/semantic-search",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_semantic_search_js_onRequestPost],
    },
  {
      routePath: "/api/subjects",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_subjects_js_onRequestGet],
    },
  {
      routePath: "/api/submissions",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submissions_js_onRequestPost],
    },
  {
      routePath: "/api/suggest-actions",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_suggest_actions_js_onRequestPost],
    },
  {
      routePath: "/api/survey-stats",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_survey_stats_js_onRequestGet],
    },
  {
      routePath: "/api/test",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_test_js_onRequestGet],
    },
  {
      routePath: "/api/cron_daily_digest",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_cron_daily_digest_js_onRequest],
    },
  {
      routePath: "/api/cron_news_ingest",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_cron_news_ingest_js_onRequest],
    },
  {
      routePath: "/api/cron_social_ingest",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_cron_social_ingest_js_onRequest],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [____path___js_onRequestGet],
    },
  ]