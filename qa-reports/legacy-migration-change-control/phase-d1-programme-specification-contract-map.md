# D1 programme specification contract map

| Contract | Parent / purpose | Identity and version | Later owner |
| --- | --- | --- | --- |
| `CurrentMesocycleProgrammeSpecification` | mesocycle future programme definition | programme ID + immutable version | D2 constructor / D3 persistence |
| `CurrentProgrammeSessionTemplate` | ordered future session shape | stable template ID inside programme lineage | D4 construction projection |
| `CurrentProgrammePrescriptionSlot` | pre-exercise future set guidance | stable slot ID, target version, template/programme parent | E2E3 service target |
| `CurrentMicrocycleProgrammeReference` | binds one microcycle to one version | plan/mesocycle/microcycle + programme/version | D5 microcycle integration |

Generated exercise settings remain derived constructor output. D1 uses no generated-array identity and introduces no runtime authority. The E2E3D standalone guidance-slot contract is superseded semantically by `CurrentProgrammePrescriptionSlot`; retain it only as a temporary compatibility seam until D2–D4 integrate the programme hierarchy.
