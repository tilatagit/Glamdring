import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { MuiForm5 as Form } from '@rjsf/material-ui';
import CaseActionSelect from 'components/form/widget/CaseActionSelect';
import CaseEvidencePostInput from 'components/form/widget/CaseEvidencePostInput';
import CaseProfileSelect from 'components/form/widget/CaseProfileSelect';
import CaseRuleSelect from 'components/form/widget/CaseRuleSelect';
import CaseWitnessesSelect from 'components/form/widget/CaseWitnessesSelect';
import useJuridictionContract from 'hooks/contracts/useJurisdictionContract';
import useToasts from 'hooks/useToasts';
import useRule from 'hooks/useRule';
import useWeb3Context from 'hooks/useWeb3Context';
import { IconWallet } from 'icons';
import { useState } from 'react';
import { palette } from 'theme/palette';

/**
 * A component with a dialog to create a case.
 *
 * TODO: Add feature to enter case name
 * TODO: Improve appearance for form validation errors
 */
export default function CaseCreateDialog({
  subjectProfile,
  affectedProfile,
  isClose,
  onClose,
}) {
  const { accountProfile, connectWallet } = useWeb3Context();
  const { showToastSuccess, showToastError } = useToasts();
  const { makeCase } = useJuridictionContract();
  const { getRuleById } = useRule();
  const [isOpen, setIsOpen] = useState(!isClose);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectProfileAccount: subjectProfile ? subjectProfile.account : null,
    affectedProfileAccount: affectedProfile ? affectedProfile.account : null,
  });
  const [formRule, setFormRule] = useState(null);

  const schema = {
    type: 'object',
    properties: {
      actionGuid: {
        type: 'string',
        title: 'Action',
      },
    },
    required: ['actionGuid'],
    dependencies: {
      actionGuid: {
        properties: {
          ruleId: {
            type: 'string',
            title: 'Rule',
          },
        },
        required: ['ruleId'],
      },
      ruleId: {
        properties: {
          subjectProfileAccount: {
            type: 'string',
            title: 'Subject',
          },
          affectedProfileAccount: {
            type: 'string',
            title: 'Affected',
          },
          evidencePostUri: {
            type: 'string',
            title: 'Evidence',
            default: '',
          },
          witnessProfileAccounts: {
            type: 'array',
            title: 'Witnesses',
            items: {
              type: 'string',
            },
            default: [],
          },
        },
        required: ['subjectProfileAccount', 'affectedProfileAccount'],
      },
    },
  };

  const uiSchema = {
    actionGuid: {
      'ui:widget': 'CaseActionSelect',
    },
    ruleId: {
      'ui:widget': 'CaseRuleSelect',
    },
    subjectProfileAccount: {
      'ui:widget': 'CaseProfileSelect',
    },
    affectedProfileAccount: {
      'ui:widget': 'CaseProfileSelect',
    },
    evidencePostUri: {
      'ui:widget': 'CaseEvidencePostInput',
      'ui:emptyValue': '',
    },
    witnessProfileAccounts: {
      'ui:widget': 'CaseWitnessesSelect',
      'ui:emptyValue': [],
    },
  };

  const widgets = {
    CaseActionSelect: CaseActionSelect,
    CaseRuleSelect: CaseRuleSelect,
    CaseProfileSelect: CaseProfileSelect,
    CaseEvidencePostInput: CaseEvidencePostInput,
    CaseWitnessesSelect: CaseWitnessesSelect,
  };

  async function close() {
    setIsOpen(false);
    onClose();
  }

  function handleChange({ formData }) {
    if (formData.ruleId) {
      getRuleById(formData.ruleId).then((rule) => setFormRule(rule));
    }
    setFormData(formData);
  }

  async function handleSubmit({ formData }) {
    try {
      setFormData(formData);
      // Check witness count
      const formRuleWitness = Number(formRule?.confirmation?.witness);
      if (formData.witnessProfileAccounts.length < formRuleWitness) {
        throw new Error(`Minimal number of witnesses: ${formRuleWitness}`);
      }
      // Define case params
      const caseName = 'TEST_CASE';
      const caseRules = [];
      caseRules.push({
        jurisdiction: process.env.NEXT_PUBLIC_JURISDICTION_CONTRACT_ADDRESS,
        ruleId: formData.ruleId,
      });
      const caseRoles = [];
      caseRoles.push({
        account: formData.subjectProfileAccount,
        role: 'subject',
      });
      caseRoles.push({
        account: formData.affectedProfileAccount,
        role: 'affected',
      });
      for (const witnessProfileAccount of formData.witnessProfileAccounts) {
        caseRoles.push({
          account: witnessProfileAccount,
          role: 'witness',
        });
      }
      const casePosts = [];
      casePosts.push({
        entRole: 'admin',
        uri: formData.evidencePostUri,
      });
      // Make case
      await makeCase(caseName, caseRules, caseRoles, casePosts);
      showToastSuccess('Success! Data will be updated soon.');
      close();
    } catch (error) {
      showToastError(error);
      setIsLoading(false);
    }
  }

  return (
    <>
      {accountProfile ? (
        <Dialog open={isOpen} onClose={close}>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogContent>
            <Form
              schema={schema}
              uiSchema={uiSchema}
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              widgets={widgets}
              formContext={{
                formData: formData,
                formRule: formRule,
              }}
              disabled={isLoading}
            >
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" type="submit">
                  Create Case
                </Button>
                <Button variant="outlined" onClick={close}>
                  Cancel
                </Button>
              </Stack>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={isOpen} onClose={close}>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogContent>
            <Typography>
              To create case and add score you need to connect wallet and create
              own profile.
            </Typography>
            <Button
              sx={{ mt: 4 }}
              variant="contained"
              onClick={() => {
                connectWallet();
                close();
              }}
              startIcon={<IconWallet hexColor={palette.primary.contrastText} />}
            >
              Connect Wallet
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
