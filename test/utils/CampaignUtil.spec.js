const CampaignUtil = require('../../lib/utils/CampaignUtil');
const logging = require('../../lib/logging');
const logger = logging.getLogger();

const { settingsFile1 } = require('../test-utils/data/settingsFiles');

let globalConfig = {
  settingsFile: settingsFile1,
  logger
};

describe('CampaignUtil', () => {
  describe('method: _getVariationBucketRange', () => {
    it('should return 0 if no vairationWeight is provided', () => {
      expect(CampaignUtil._getVariationBucketRange()).toBe(0);
    });
    it('should return the startRange for variation bucketing', () => {
      expect(CampaignUtil._getVariationBucketRange(0)).toBe(0);
      expect(CampaignUtil._getVariationBucketRange(10)).toBe(1000);
      expect(CampaignUtil._getVariationBucketRange(20)).toBe(2000);
      expect(CampaignUtil._getVariationBucketRange(30)).toBe(3000);
      expect(CampaignUtil._getVariationBucketRange(40)).toBe(4000);
      expect(CampaignUtil._getVariationBucketRange(50)).toBe(5000);
      expect(CampaignUtil._getVariationBucketRange(60)).toBe(6000);
      expect(CampaignUtil._getVariationBucketRange(70)).toBe(7000);
      expect(CampaignUtil._getVariationBucketRange(80)).toBe(8000);
      expect(CampaignUtil._getVariationBucketRange(90)).toBe(9000);
      expect(CampaignUtil._getVariationBucketRange(100)).toBe(10000);
    });
  });

  describe('method: getCampaign', () => {
    it('should return null if campaign is not found corresponding to the key passed', () => {
      expect(CampaignUtil.getCampaign(globalConfig.settingsFile, 'SOME_RANDOM_KEY')).toBeUndefined();
    });

    it('should return campaign if campaign is found corresponding to the key passed', () => {
      expect(CampaignUtil.getCampaign(globalConfig.settingsFile, 'DEV_TEST_1')).toBeDefined();
    });
  });

  describe('method: getCampaignStatus', () => {
    it('should return empty string if campaign or its status is not defined', () => {
      expect(CampaignUtil.getCampaignStatus(globalConfig.settingsFile, 'SOME_RANDOM_KEY')).toBe('');
    });

    it('should return the status of the campaign, if found, corresponding to the key passed', () => {
      expect(CampaignUtil.getCampaignStatus(globalConfig.settingsFile, 'DEV_TEST_1')).toBeDefined();
      expect(CampaignUtil.getCampaignStatus(globalConfig.settingsFile, 'DEV_TEST_1')).toBe('running');
    });
  });

  describe('method: isCampaignRunning', () => {
    it('should return false if campaign is not running', () => {
      expect(CampaignUtil.isCampaignRunning(globalConfig.settingsFile, 'SOME_RANDOM_KEY')).toBe(false);
    });

    it('should return true if campaign is running', () => {
      expect(CampaignUtil.isCampaignRunning(globalConfig.settingsFile, 'DEV_TEST_1')).toBe(true);
    });
  });

  describe('method: validateCampaign', () => {
    it('should validate whether a campaign is valid or not', () => {
      expect(CampaignUtil.validateCampaign(globalConfig.settingsFile.campaigns[0])).toBe(true);

      expect(CampaignUtil.validateCampaign(globalConfig.settingsFile.campaigns[1])).toBe(false); // no such thing exists
    });
  });

  describe('method: setVariationAllocation', () => {
    it('should set the correct start and end range for every variation of a campaign passed', () => {
      const campaignWithTwoVariation = {
        variations: [
          {
            id: 1,
            weight: 50
          },
          {
            id: 2,
            weight: 50
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithTwoVariation);

      expect(campaignWithTwoVariation.variations[0].startVariationAllocation).toBe(1);
      expect(campaignWithTwoVariation.variations[0].endVariationAllocation).toBe(5000);
      expect(campaignWithTwoVariation.variations[1].startVariationAllocation).toBe(5001);
      expect(campaignWithTwoVariation.variations[1].endVariationAllocation).toBe(10000);

      const campaignWithTwoVariationAndUnevenSplit = {
        variations: [
          {
            id: 1,
            weight: 10.1
          },
          {
            id: 2,
            weight: 89.9
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithTwoVariationAndUnevenSplit);

      expect(campaignWithTwoVariationAndUnevenSplit.variations[0].startVariationAllocation).toBe(1);
      expect(campaignWithTwoVariationAndUnevenSplit.variations[0].endVariationAllocation).toBe(1010);
      expect(campaignWithTwoVariationAndUnevenSplit.variations[1].startVariationAllocation).toBe(1011);
      expect(campaignWithTwoVariationAndUnevenSplit.variations[1].endVariationAllocation).toBe(10000);

      const campaignWithTwoVariationAndOneDisabled = {
        variations: [
          {
            id: 1,
            weight: 0
          },
          {
            id: 2,
            weight: 100
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithTwoVariationAndOneDisabled);

      expect(campaignWithTwoVariationAndOneDisabled.variations[0].startVariationAllocation).toBe(-1);
      expect(campaignWithTwoVariationAndOneDisabled.variations[0].endVariationAllocation).toBe(-1);
      expect(campaignWithTwoVariationAndOneDisabled.variations[1].startVariationAllocation).toBe(1);
      expect(campaignWithTwoVariationAndOneDisabled.variations[1].endVariationAllocation).toBe(10000);

      const campaignWithThreeVariations = {
        variations: [
          {
            id: 1,
            weight: 33.3333
          },
          {
            id: 2,
            weight: 33.3333
          },
          {
            id: 3,
            weight: 33.3333
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithThreeVariations);

      expect(campaignWithThreeVariations.variations[0].startVariationAllocation).toBe(1);
      expect(campaignWithThreeVariations.variations[0].endVariationAllocation).toBe(3334);
      expect(campaignWithThreeVariations.variations[1].startVariationAllocation).toBe(3335);
      expect(campaignWithThreeVariations.variations[1].endVariationAllocation).toBe(6668);
      expect(campaignWithThreeVariations.variations[2].startVariationAllocation).toBe(6669);
      expect(campaignWithThreeVariations.variations[2].endVariationAllocation).toBe(10002);

      const campaignWithThreeVariationsWithUnevenSplit = {
        variations: [
          {
            id: 1,
            weight: 10.1
          },
          {
            id: 2,
            weight: 50.5
          },
          {
            id: 3,
            weight: 39.4
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithThreeVariationsWithUnevenSplit);

      expect(campaignWithThreeVariationsWithUnevenSplit.variations[0].startVariationAllocation).toBe(1);
      expect(campaignWithThreeVariationsWithUnevenSplit.variations[0].endVariationAllocation).toBe(1010);
      expect(campaignWithThreeVariationsWithUnevenSplit.variations[1].startVariationAllocation).toBe(1011);
      expect(campaignWithThreeVariationsWithUnevenSplit.variations[1].endVariationAllocation).toBe(6060);
      expect(campaignWithThreeVariationsWithUnevenSplit.variations[2].startVariationAllocation).toBe(6061);
      expect(campaignWithThreeVariationsWithUnevenSplit.variations[2].endVariationAllocation).toBe(10000);

      const campaignWithFourVariations = {
        variations: [
          {
            id: 1,
            weight: 25
          },
          {
            id: 2,
            weight: 25
          },
          {
            id: 3,
            weight: 30
          },
          {
            id: 4,
            weight: 20
          }
        ]
      };

      CampaignUtil.setVariationAllocation(campaignWithFourVariations);

      expect(campaignWithFourVariations.variations[0].startVariationAllocation).toBe(1);
      expect(campaignWithFourVariations.variations[0].endVariationAllocation).toBe(2500);
      expect(campaignWithFourVariations.variations[1].startVariationAllocation).toBe(2501);
      expect(campaignWithFourVariations.variations[1].endVariationAllocation).toBe(5000);
      expect(campaignWithFourVariations.variations[2].startVariationAllocation).toBe(5001);
      expect(campaignWithFourVariations.variations[2].endVariationAllocation).toBe(8000);
      expect(campaignWithFourVariations.variations[3].startVariationAllocation).toBe(8001);
      expect(campaignWithFourVariations.variations[3].endVariationAllocation).toBe(10000);
    });
  });

  describe('method: getCampaignGoal', () => {
    it('should return null if config / campaign / goal is not found', () => {
      expect(CampaignUtil.getCampaignGoal()).toBe(null);
      expect(CampaignUtil.getCampaignGoal(globalConfig)).toBe(null);
      expect(CampaignUtil.getCampaignGoal(globalConfig, 'SOME_RANDOM_KEY')).toBe(null);
      expect(CampaignUtil.getCampaignGoal(globalConfig, 'DEV_TEST_1')).toBe(null);
      expect(CampaignUtil.getCampaignGoal(globalConfig, 'DEV_TEST_1', 'SOME_RANDOM_IDENTIFIER')).toBe(null);
    });
    it('should return a goal if required params are passed correctly', () => {
      const goal = CampaignUtil.getCampaignGoal(globalConfig, 'DEV_TEST_1', 'CUSTOM');

      expect(goal).toBeDefined();
      expect(goal.id).toBeDefined();
      expect(goal.identifier).toBeDefined();
    });
  });

  describe('method: getCampaignVariation', () => {
    it('should return null if config / campaign / goal is not found', () => {
      expect(CampaignUtil.getCampaignVariation()).toBe(null);
      expect(CampaignUtil.getCampaignVariation(globalConfig)).toBe(null);
      expect(CampaignUtil.getCampaignVariation(globalConfig, 'SOME_RANDOM_KEY')).toBe(null);
      expect(CampaignUtil.getCampaignVariation(globalConfig, 'DEV_TEST_1')).toBe(null);
      expect(CampaignUtil.getCampaignVariation(globalConfig, 'DEV_TEST_1', 'SOME_RANDOM_VARIATION_NAME')).toBe(null);
    });
    it('should return a goal if required params are passed correctly', () => {
      const variation = CampaignUtil.getCampaignVariation(globalConfig, 'DEV_TEST_1', 'Control');

      expect(variation).toBeDefined();
      expect(variation.id).toBeDefined();
      expect(variation.name).toBeDefined();
      expect(variation.weight).toBeDefined();
    });
  });
});
