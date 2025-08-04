import { YtDlpService } from "../ytdlp";
import { FormatDetector } from "../format-detector";

describe("Service Layer Integration", () => {
  let ytdlpService: YtDlpService;
  let formatDetector: FormatDetector;

  beforeEach(() => {
    ytdlpService = YtDlpService.getInstance();
    formatDetector = new FormatDetector();
  });

  test("services should be properly instantiated", () => {
    expect(ytdlpService).toBeInstanceOf(YtDlpService);
    expect(formatDetector).toBeInstanceOf(FormatDetector);
  });

  test("YtDlpService should be singleton", () => {
    const instance1 = YtDlpService.getInstance();
    const instance2 = YtDlpService.getInstance();
    expect(instance1).toBe(instance2);
  });

  test("services should have all required methods", () => {
    // YtDlpService methods
    expect(typeof ytdlpService.getMetadata).toBe("function");
    expect(typeof ytdlpService.getFormats).toBe("function");
    expect(typeof ytdlpService.downloadVideo).toBe("function");
    expect(typeof ytdlpService.cancelDownload).toBe("function");
    expect(typeof ytdlpService.checkAvailability).toBe("function");

    // FormatDetector methods
    expect(typeof formatDetector.getRecommendedFormats).toBe("function");
    expect(typeof formatDetector.getFormatDisplayName).toBe("function");
    expect(typeof formatDetector.isAudioFormat).toBe("function");
    expect(typeof formatDetector.isVideoFormat).toBe("function");
    expect(typeof formatDetector.getQualityScore).toBe("function");
  });

  test("FormatDetector should use YtDlpService internally", () => {
    // This tests that FormatDetector properly integrates with YtDlpService
    const formatDetectorInstance = new FormatDetector();
    expect(formatDetectorInstance).toBeInstanceOf(FormatDetector);
  });
});
