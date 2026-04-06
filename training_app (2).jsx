import { useState, useEffect, useMemo, useRef } from "react";

const CAL_TARGET = 3000;
const PROT_TARGET = 165;
const kj2kcal = v => Math.round(v * 0.239006);

const CAT_COLOR = {
  chest:'#E24B4A',back:'#378ADD',shoulders:'#EF9F27',biceps:'#1D9E75',
  triceps:'#D85A30',legs:'#7F77DD',core:'#888780',cardio:'#5DCAA5',other:'#B4B2A9'
};
const CAT_BG = {
  chest:'#FCEBEB',back:'#E6F1FB',shoulders:'#FAEEDA',biceps:'#E1F5EE',
  triceps:'#FAECE7',legs:'#EEEDFE',core:'#F1EFE8',cardio:'#E1F5EE',other:'#F1EFE8'
};

// ─── EXERCISE LIBRARY ─────────────────────────────────────────────────────────
const EX_INIT = [
  {id:'back_extension',name:'Back extension',cat:'legs',type:'weighted_bw',split:'Legs'},
  {id:'bench_press',name:'Bench press',cat:'chest',type:'bilateral',split:'Push A'},
  {id:'bicep_cable_curl',name:'Bicep cable curl',cat:'biceps',type:'bilateral',split:'Pull B'},
  {id:'bicep_curl',name:'Bicep curl',cat:'biceps',type:'unilateral',split:'Pull A'},
  {id:'bird_dog',name:'Bird dog',cat:'core',type:'duration',split:'Abs'},
  {id:'cardio',name:'Cardio',cat:'cardio',type:'duration',split:'Cardio'},
  {id:'chest_fly',name:'Chest fly',cat:'chest',type:'bilateral',split:'Push A'},
  {id:'chest_press_cable',name:'Chest press cable',cat:'chest',type:'bilateral',split:'Push A'},
  {id:'decline_cable_fly',name:'Decline cable fly',cat:'chest',type:'bilateral',split:'Push B'},
  {id:'decline_press',name:'Decline press',cat:'chest',type:'bilateral',split:'Push B'},
  {id:'glute_bridge',name:'Glute bridge',cat:'legs',type:'bilateral',split:'Legs'},
  {id:'incline_press',name:'Incline press',cat:'chest',type:'bilateral',split:'Push B'},
  {id:'isolateral_pull',name:'Isolateral pull',cat:'back',type:'bilateral',split:'Pull A'},
  {id:'isolateral_pulldown',name:'Isolateral pulldown',cat:'back',type:'bilateral',split:'Pull B'},
  {id:'lat_pulldown_wide',name:'Lat pulldown wide pronated',cat:'back',type:'bilateral',split:'Pull A'},
  {id:'lateral_raise',name:'Lateral raise',cat:'shoulders',type:'bilateral',split:'Shoulders'},
  {id:'leg_curl',name:'Leg curl',cat:'legs',type:'bilateral',split:'Legs'},
  {id:'leg_raise_lying',name:'Leg raise lying down',cat:'core',type:'reps_only',split:'Abs'},
  {id:'lunge',name:'Lunge',cat:'legs',type:'bilateral',split:'Legs'},
  {id:'mid_lat_row',name:'Mid lat row',cat:'back',type:'bilateral',split:'Pull B'},
  {id:'neutral_crunch',name:'Neutral crunch',cat:'core',type:'reps_only',split:'Abs'},
  {id:'pallof_press',name:'Pallof press',cat:'core',type:'unilateral_load',split:'Abs'},
  {id:'plank',name:'Plank',cat:'core',type:'duration',split:'Abs'},
  {id:'preacher_curl',name:'Preacher curl',cat:'biceps',type:'bilateral',split:'Pull B'},
  {id:'prone_leg_curl',name:'Prone leg curl',cat:'legs',type:'bilateral',split:'Legs'},
  {id:'pullups',name:'Pull-ups',cat:'back',type:'bodyweight',split:'Pull A'},
  {id:'pullups_weighted',name:'Pull-ups weighted',cat:'back',type:'weighted_bw',split:'Pull A'},
  {id:'pushups',name:'Push-ups',cat:'chest',type:'bodyweight',split:'Push B'},
  {id:'reverse_curl',name:'Reverse curl',cat:'biceps',type:'bilateral',split:'Pull B'},
  {id:'reverse_fly',name:'Reverse fly',cat:'shoulders',type:'bilateral',split:'Shoulders'},
  {id:'short_neutral_pulldown',name:'Short neutral pulldown',cat:'back',type:'bilateral',split:'Pull B'},
  {id:'shoulder_press',name:'Shoulder press',cat:'shoulders',type:'bilateral',split:'Shoulders'},
  {id:'side_crunches',name:'Side crunches',cat:'core',type:'reps_only',split:'Abs'},
  {id:'supine_press',name:'Supine press',cat:'chest',type:'bilateral',split:'Push B'},
  {id:'tricep_dips',name:'Tricep dips',cat:'triceps',type:'weighted_bw',split:'Push A'},
  {id:'tricep_pushdown',name:'Tricep pushdown',cat:'triceps',type:'bilateral',split:'Push A'},
  {id:'tricep_pushdown_crossbody',name:'Tricep pushdown cross-body',cat:'triceps',type:'unilateral',split:'Push B'},
  {id:'walk',name:'Walk',cat:'cardio',type:'duration',split:'Cardio'},
  {id:'wide_row',name:'Wide row',cat:'back',type:'bilateral',split:'Pull A'},
];

// ─── SPLITS (new 6-day structure) ─────────────────────────────────────────────
const SPLITS = [
  {name:'Push A',day:1,exIds:['bench_press','tricep_dips','chest_fly','tricep_pushdown'],
   benchmarks:{bench_press:'90kg×4',tricep_dips:'+30kg×10,8',tricep_pushdown:'42.8kg×4'}},
  {name:'Push B',day:1,exIds:['incline_press','decline_cable_fly','tricep_pushdown_crossbody'],
   benchmarks:{incline_press:'80kg×5',decline_cable_fly:'13.6kg×11',tricep_pushdown_crossbody:'11.3kg R7/L5'}},
  {name:'Pull A',day:2,exIds:['bicep_curl','pullups_weighted','wide_row'],
   benchmarks:{bicep_curl:'30kg R5',pullups_weighted:'+5kg×9',wide_row:'75kg×4'}},
  {name:'Pull B',day:2,exIds:['bicep_cable_curl','isolateral_pulldown','short_neutral_pulldown'],
   benchmarks:{bicep_cable_curl:'15.9kg×8',isolateral_pulldown:'180kg×11',short_neutral_pulldown:'107kg×6'}},
  {name:'Abs',day:3,exIds:['plank','bird_dog','pallof_press','side_crunches','leg_raise_lying']},
  {name:'Shoulders',day:4,exIds:['shoulder_press','lateral_raise','reverse_fly'],
   benchmarks:{shoulder_press:'45kg×6',lateral_raise:'9.1kg×10',reverse_fly:'107kg×6'}},
  {name:'Legs',day:5,exIds:['lunge','prone_leg_curl','glute_bridge','back_extension'],
   benchmarks:{lunge:'50kg×14',prone_leg_curl:'90kg×7',glute_bridge:'140kg×13',back_extension:'+10kg×16'}},
  {name:'Rest / Swimming',day:6,exIds:[]},
];

// ─── FOOD LIBRARY ─────────────────────────────────────────────────────────────
const FOODS_INIT = [
  {id:'protein_shake',name:'Protein shake',cal:180,prot:20,carb:5,fat:3,serving:'1 shake',exact:true},
  {id:'black_coffee',name:'Black coffee',cal:0,prot:0,carb:0,fat:0,serving:'1 cup',exact:true},
  {id:'musashi_bar',name:'Musashi protein bar',cal:342,prot:45,carb:21,fat:7,serving:'1 bar',exact:true},
  {id:'choc_buttons',name:'Choc buttons',cal:135,prot:2,carb:16,fat:7,serving:'1 serving',estimated:true},
  {id:'banana',name:'Banana',cal:105,prot:1.3,carb:27,fat:0.4,serving:'1 medium',estimated:true,editable:true},
  {id:'honey_spoon',name:'Honey spoon',cal:50,prot:0,carb:13,fat:0,serving:'1 spoon',exact:true},
  {id:'granola',name:'Granola',cal:210,prot:4.6,carb:35,fat:5,serving:'1 serving',exact:true},
  {id:'yopro_yoghurt',name:'YoPro yoghurt',cal:91,prot:15,carb:8,fat:0.5,serving:'1 tub',exact:true},
  {id:'soco_tofu',name:'So Co protein tofu block',cal:kj2kcal(2250),prot:60.3,carb:5,fat:12,serving:'1 block',sourceKj:2250,exact:true},
  {id:'rice',name:'Rice (two fists)',cal:200,prot:4,carb:44,fat:0.5,serving:'two fists',estimated:true,editable:true},
  {id:'mushrooms',name:'Mushrooms (2 cups, butter)',cal:40,prot:3,carb:6,fat:0.5,serving:'2 cups',estimated:true,editable:true},
  {id:'hoisin_sauce',name:'Hoisin sauce',cal:kj2kcal(74.8),prot:0.5,carb:4,fat:0,serving:'1 serving',sourceKj:74.8,exact:true},
  {id:'capsicum_onion',name:'Capsicum + onion',cal:40,prot:1,carb:8,fat:0,serving:'1 cup mix',estimated:true,editable:true},
  {id:'spray_oil',name:'Spray oil',cal:41,prot:0,carb:0,fat:4.6,serving:'1–2 sprays',calPerServing:41},
];

const MEAL_TEMPLATES_INIT = [
  {id:'morning',name:'Morning',items:[{foodId:'protein_shake',qty:1},{foodId:'black_coffee',qty:1},{foodId:'musashi_bar',qty:1}]},
  {id:'yoghurt_snack',name:'Yoghurt snack',items:[{foodId:'choc_buttons',qty:1},{foodId:'banana',qty:1},{foodId:'honey_spoon',qty:1},{foodId:'granola',qty:0.5},{foodId:'yopro_yoghurt',qty:1}]},
  {id:'dinner',name:'Dinner',items:[{foodId:'soco_tofu',qty:1},{foodId:'rice',qty:1},{foodId:'mushrooms',qty:1},{foodId:'hoisin_sauce',qty:1},{foodId:'capsicum_onion',qty:1},{foodId:'spray_oil',qty:2}]},
];

// ─── COMPLETE HISTORICAL DATA ─────────────────────────────────────────────────
const HIST_INIT = [
  {id:'h_28jan',date:'2025-01-28',name:'Pull',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:50,reps:7},{t:'working',load:50,reps:5},{t:'drop',load:40,reps:6}]},
    {exId:'isolateral_pull',sets:[{t:'working',load:170,reps:7},{t:'working',load:170,reps:6},{t:'drop',load:160,reps:5}]},
    {exId:'lat_pulldown_wide',sets:[{t:'working',load:93,reps:7},{t:'working',load:93,reps:5},{t:'drop',load:79,reps:6}]},
    {exId:'walk',sets:[{t:'duration',dur:15}]},
  ]},
  {id:'h_29jan',date:'2025-01-29',name:'Triceps',exercises:[
    {exId:'tricep_pushdown',sets:[{t:'working',load:38.3,reps:11},{t:'working',load:38.3,reps:6},{t:'working',load:38.3,reps:5}]},
    {exId:'tricep_pushdown_crossbody',sets:[{t:'unilateral',load:9,r:9,l:7},{t:'unilateral',load:9,r:8,l:7},{t:'unilateral',load:9,r:6,l:6}]},
  ]},
  {id:'h_30jan',date:'2025-01-30',name:'Push + Pull-ups',exercises:[
    {exId:'incline_press',sets:[{t:'working',load:70,reps:6},{t:'working',load:70,reps:3},{t:'working',load:70,reps:6}]},
    {exId:'decline_cable_fly',sets:[{t:'working',load:11.3,reps:13},{t:'working',load:11.3,reps:9},{t:'working',load:11.3,reps:9}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:6},{t:'working',load:30,reps:3},{t:'bodyweight',reps:16}]},
    {exId:'pullups',sets:[{t:'bodyweight',reps:8},{t:'bodyweight',reps:8}]},
  ]},
  {id:'h_31jan',date:'2025-01-31',name:'Shoulders + Biceps',exercises:[
    {exId:'shoulder_press',sets:[{t:'working',load:40,reps:11},{t:'working',load:40,reps:6},{t:'drop',load:30,reps:5}]},
    {exId:'bicep_curl',sets:[{t:'unilateral',load:27.5,r:7,l:4},{t:'unilateral',load:27.5,r:4,l:3},{t:'unilateral',load:27.5,r:3,l:1}]},
    {exId:'bicep_cable_curl',sets:[{t:'working',load:11.3,reps:14},{t:'working',load:11.3,reps:11},{t:'working',load:11.3,reps:7}]},
  ]},
  {id:'h_3feb',date:'2025-02-03',name:'Pull + Shoulders',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:50,reps:9},{t:'working',load:50,reps:4},{t:'drop',load:40,reps:5}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:100,reps:7},{t:'working',load:100,reps:4},{t:'drop',load:93,reps:3}]},
    {exId:'isolateral_pull',sets:[{t:'working',load:170,reps:6},{t:'working',load:170,reps:7},{t:'working',load:170,reps:4}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:3},{t:'working',load:6.8,reps:7},{t:'working',load:6.8,reps:5}]},
    {exId:'reverse_fly',sets:[{t:'working',load:107,reps:5},{t:'working',load:100,reps:4}]},
  ]},
  {id:'h_4feb',date:'2025-02-04',name:'Push',exercises:[
    {exId:'incline_press',sets:[{t:'working',load:70,reps:5},{t:'working',load:70,reps:6}]},
    {exId:'chest_press_cable',sets:[{t:'working',load:72,reps:7},{t:'working',load:72,reps:7},{t:'drop',load:54,reps:5}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:8},{t:'working',load:30,reps:5},{t:'bodyweight',reps:17}]},
  ]},
  {id:'h_5feb',date:'2025-02-05',name:'Legs + Core',exercises:[
    {exId:'lunge',sets:[{t:'working',load:25,reps:9},{t:'working',load:25,reps:6}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:90,reps:6},{t:'working',load:90,reps:3},{t:'drop',load:86,reps:4}]},
    {exId:'glute_bridge',sets:[{t:'working',load:120,reps:11},{t:'working',load:120,reps:9}]},
    {exId:'back_extension',sets:[{t:'bodyweight',reps:15},{t:'bodyweight',reps:16}]},
    {exId:'plank',sets:[{t:'duration',dur:2}]},
  ]},
  {id:'h_9feb',date:'2025-02-09',name:'Pull',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:60,reps:6},{t:'working',load:55,reps:6},{t:'working',load:50,reps:6}]},
    {exId:'isolateral_pull',sets:[{t:'working',load:180,reps:9},{t:'working',load:180,reps:11},{t:'working',load:180,reps:5}]},
  ]},
  {id:'h_10feb',date:'2025-02-10',name:'Push',exercises:[
    {exId:'decline_press',sets:[{t:'working',load:50,reps:5},{t:'working',load:50,reps:5},{t:'working',load:50,reps:4}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:7},{t:'working',load:30,reps:6},{t:'bodyweight',reps:12}]},
  ]},
  {id:'h_11feb',date:'2025-02-11',name:'Shoulders + Triceps',exercises:[
    {exId:'shoulder_press',sets:[{t:'working',load:45,reps:6},{t:'working',load:45,reps:4},{t:'drop',load:40,reps:3}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:7},{t:'working',load:9.1,reps:4},{t:'drop',load:6.8,reps:5}]},
    {exId:'tricep_pushdown_crossbody',sets:[{t:'unilateral',load:9,r:9,l:7},{t:'unilateral',load:9,r:8,l:8},{t:'unilateral',load:9,r:9,l:9}]},
  ]},
  {id:'h_12feb',date:'2025-02-12',name:'Legs + Core',exercises:[
    {exId:'lunge',sets:[{t:'working',load:25,reps:11},{t:'working',load:25,reps:6},{t:'working',load:25,reps:4}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:90,reps:7},{t:'working',load:90,reps:5},{t:'drop',load:86,reps:2}]},
    {exId:'back_extension',sets:[{t:'bodyweight',reps:14},{t:'bodyweight',reps:14}]},
    {exId:'plank',sets:[{t:'duration',dur:2}]},
  ]},
  {id:'h_14feb',date:'2025-02-14',name:'Pull + Biceps',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:60,reps:7},{t:'working',load:60,reps:5},{t:'drop',load:50,reps:5}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:4},{t:'working',load:107,reps:3},{t:'working',load:107,reps:3}]},
    {exId:'bicep_curl',sets:[{t:'unilateral',load:27.5,r:7,l:4},{t:'unilateral',load:27.5,r:4,l:2},{t:'unilateral',load:27.5,r:1,l:2}]},
    {exId:'bicep_cable_curl',sets:[{t:'working',load:13.6,reps:9},{t:'working',load:13.6,reps:8},{t:'working',load:13.6,reps:6}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:7},{t:'working',load:9.1,reps:4},{t:'drop',load:6.8,reps:7}]},
  ]},
  {id:'h_16feb',date:'2025-02-16',name:'Push',exercises:[
    {exId:'decline_cable_fly',sets:[{t:'working',load:13.6,reps:11},{t:'working',load:13.6,reps:8},{t:'working',load:13.6,reps:7}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:7},{t:'working',load:30,reps:6},{t:'bodyweight',reps:11}]},
    {exId:'supine_press',sets:[{t:'working',load:140,reps:5},{t:'working',load:120,reps:7},{t:'working',load:120,reps:5}]},
  ]},
  {id:'h_17feb',date:'2025-02-17',name:'Shoulders + Pull',exercises:[
    {exId:'shoulder_press',sets:[{t:'working',load:45,reps:6},{t:'working',load:45,reps:4},{t:'drop',load:40,reps:3}]},
    {exId:'mid_lat_row',sets:[{t:'working',load:60,reps:10},{t:'working',load:60,reps:6}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:7},{t:'working',load:9.1,reps:4},{t:'drop',load:6.8,reps:7}]},
  ]},
  {id:'h_18feb',date:'2025-02-18',name:'Legs + Pull-ups',exercises:[
    {exId:'lunge',sets:[{t:'working',load:25,reps:10},{t:'working',load:25,reps:8},{t:'working',load:25,reps:4}]},
    {exId:'glute_bridge',sets:[{t:'working',load:120,reps:15},{t:'working',load:120,reps:9},{t:'working',load:120,reps:8}]},
    {exId:'back_extension',sets:[{t:'bodyweight',reps:20},{t:'bodyweight',reps:15}]},
    {exId:'pullups',sets:[{t:'bodyweight',reps:12},{t:'bodyweight',reps:7},{t:'bodyweight',reps:8}]},
  ]},
  {id:'h_20feb',date:'2025-02-20',name:'Abs',exercises:[
    {exId:'plank',sets:[{t:'duration',dur:2}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:3},{t:'duration',dur:3}]},
    {exId:'neutral_crunch',sets:[{t:'reps_only',reps:20},{t:'reps_only',reps:20}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:6.8,r:17,l:17},{t:'unilateral_load',load:6.8,r:14,l:14}]},
  ]},
  {id:'h_21feb',date:'2025-02-21',name:'Push',exercises:[
    {exId:'bench_press',sets:[{t:'working',load:80,reps:7},{t:'working',load:80,reps:6}]},
    {exId:'incline_press',sets:[{t:'working',load:70,reps:5},{t:'working',load:70,reps:4},{t:'working',load:70,reps:4}]},
  ]},
  {id:'h_23feb',date:'2025-02-23',name:'Pull + Biceps',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:65,reps:6},{t:'working',load:65,reps:4},{t:'drop',load:60,reps:4}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:6},{t:'working',load:107,reps:3},{t:'drop',load:86,reps:3}]},
    {exId:'bicep_curl',sets:[{t:'unilateral',load:27.5,r:9,l:4},{t:'unilateral',load:27.5,r:5,l:3},{t:'unilateral',load:27.5,r:4,l:2}]},
  ]},
  {id:'h_24feb',date:'2025-02-24',name:'Push',exercises:[
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:8},{t:'working',load:30,reps:7},{t:'bodyweight',reps:12}]},
    {exId:'decline_press',sets:[{t:'working',load:100,reps:6},{t:'working',load:100,reps:2},{t:'working',load:100,reps:3}]},
    {exId:'tricep_pushdown_crossbody',sets:[{t:'unilateral',load:9,r:7,l:7},{t:'unilateral',load:9,r:7,l:6},{t:'unilateral',load:9,r:7,l:6}]},
  ]},
  {id:'h_25feb',date:'2025-02-25',name:'Shoulders',exercises:[
    {exId:'shoulder_press',sets:[{t:'working',load:50,reps:2,note:'new weight'},{t:'working',load:45,reps:6},{t:'working',load:45,reps:4}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:10},{t:'working',load:9.1,reps:4},{t:'drop',load:6.8,reps:3}]},
    {exId:'reverse_fly',sets:[{t:'working',load:107,reps:6},{t:'working',load:107,reps:5}]},
    {exId:'tricep_pushdown',sets:[{t:'working',load:22.5,reps:7},{t:'working',load:22.5,reps:6}]},
  ]},
  {id:'h_26feb',date:'2025-02-26',name:'Legs',exercises:[
    {exId:'lunge',sets:[{t:'working',load:50,reps:14},{t:'working',load:50,reps:7}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:81,reps:8},{t:'working',load:81,reps:4},{t:'working',load:81,reps:2}]},
    {exId:'glute_bridge',sets:[{t:'working',load:140,reps:13},{t:'working',load:140,reps:9}]},
    {exId:'back_extension',sets:[{t:'working',load:5,reps:20},{t:'working',load:5,reps:22}]},
  ]},
  {id:'h_28feb',date:'2025-02-28',name:'Abs + Cardio',exercises:[
    {exId:'plank',sets:[{t:'duration',dur:2}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:3},{t:'duration',dur:3}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:9,r:12,l:12},{t:'unilateral_load',load:9,r:8,l:8},{t:'unilateral_load',load:9,r:5,l:5}]},
    {exId:'cardio',sets:[{t:'duration',dur:20}]},
  ]},
  {id:'h_1mar',date:'2025-03-01',name:'Pull A',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:65,reps:6},{t:'working',load:65,reps:4}]},
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:4,note:'R side'},{t:'unilateral',load:27.5,r:4,l:3,note:'partial sets'}]},
  ]},
  {id:'h_3mar',date:'2025-03-03',name:'Push A',exercises:[
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:10},{t:'working',load:30,reps:8},{t:'bodyweight',reps:18,note:'BW PB'}]},
  ]},
  {id:'h_5mar',date:'2025-03-05',name:'Pull + Shoulders',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:70,reps:6},{t:'working',load:70,reps:4},{t:'drop',load:60,reps:3}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:5},{t:'working',load:107,reps:3},{t:'drop',load:86,reps:3}]},
    {exId:'shoulder_press',sets:[{t:'working',load:45,reps:6},{t:'working',load:45,reps:4},{t:'drop',load:40,reps:3}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:8},{t:'working',load:9.1,reps:6}]},
    {exId:'tricep_pushdown',sets:[{t:'working',load:42.8,reps:4},{t:'working',load:40.5,reps:4},{t:'working',load:40.5,reps:3}]},
    {exId:'tricep_pushdown_crossbody',sets:[{t:'unilateral',load:11.3,r:7,l:5},{t:'unilateral',load:11.3,r:4,l:3}]},
  ]},
  {id:'h_6mar',date:'2025-03-06',name:'Push A',exercises:[
    {exId:'bench_press',sets:[{t:'working',load:80,reps:9},{t:'working',load:80,reps:5,note:'+1 assist'},{t:'working',load:80,reps:3}]},
    {exId:'incline_press',sets:[{t:'working',load:70,reps:6},{t:'working',load:70,reps:8},{t:'working',load:70,reps:4}]},
  ]},
  {id:'h_7mar',date:'2025-03-07',name:'Pull A',exercises:[
    {exId:'pullups',sets:[{t:'bodyweight',reps:10},{t:'bodyweight',reps:12}]},
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:4,note:'R side'},{t:'unilateral',load:27.5,r:4,l:3,note:'partial'}]},
    {exId:'bicep_cable_curl',sets:[{t:'working',load:15.9,reps:7},{t:'working',load:15.9,reps:8}]},
  ]},
  {id:'h_8mar',date:'2025-03-08',name:'Legs + Cardio',exercises:[
    {exId:'lunge',sets:[{t:'working',load:50,reps:14},{t:'working',load:50,reps:10},{t:'working',load:50,reps:7}]},
    {exId:'glute_bridge',sets:[{t:'working',load:140,reps:9},{t:'working',load:140,reps:7}]},
    {exId:'cardio',sets:[{t:'duration',dur:25}]},
  ]},
  {id:'h_9mar',date:'2025-03-09',name:'Abs',exercises:[
    {exId:'back_extension',sets:[{t:'working',load:10,reps:16},{t:'working',load:10,reps:9},{t:'working',load:10,reps:10}]},
    {exId:'plank',sets:[{t:'duration',dur:1.5,note:'harder variation / lengthened hold'}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:3},{t:'duration',dur:3}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:11.3,r:7,l:7},{t:'unilateral_load',load:11.3,r:6,l:6},{t:'unilateral_load',load:11.3,r:5,l:5}]},
  ]},
  {id:'h_11mar',date:'2025-03-11',name:'Pull A',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:75,reps:4},{t:'working',load:70,reps:4},{t:'working',load:60,reps:6}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:5},{t:'working',load:107,reps:3},{t:'drop',load:86,reps:3}]},
    {exId:'pullups_weighted',sets:[{t:'working',load:5,reps:9},{t:'working',load:5,reps:7}]},
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:5,note:'R top set'},{t:'unilateral',load:27.5,r:4,l:4},{t:'unilateral',load:27.5,r:4,l:3},{t:'unilateral',load:27.5,r:4,l:1}]},
    {exId:'preacher_curl',sets:[{t:'working',load:100,reps:7},{t:'working',load:100,reps:5}]},
  ]},
  {id:'h_12mar',date:'2025-03-12',name:'Push A',exercises:[
    {exId:'bench_press',sets:[{t:'working',load:90,reps:4,note:'PB'},{t:'working',load:85,reps:7},{t:'working',load:85,reps:5,note:'+1 assist'}]},
    {exId:'incline_press',sets:[{t:'working',load:90,reps:1,note:'1RM'},{t:'working',load:80,reps:5},{t:'working',load:80,reps:4},{t:'working',load:80,reps:3}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:4},{t:'working',load:30,reps:4},{t:'bodyweight',reps:3}]},
  ]},
  // ─ RSP Phase (Mar 13+) ─
  {id:'h_13mar',date:'2025-03-13',name:'RSP Benchmarks',note:'Phase start — all benchmarks recorded',exercises:[
    {exId:'bench_press',sets:[{t:'working',load:90,reps:4,note:'RSP top set'},{t:'working',load:85,reps:7}]},
    {exId:'incline_press',sets:[{t:'working',load:90,reps:1,note:'1RM'},{t:'working',load:80,reps:5}]},
    {exId:'decline_press',sets:[{t:'working',load:100,reps:9},{t:'working',load:100,reps:4},{t:'working',load:100,reps:4}]},
    {exId:'tricep_dips',sets:[{t:'working',load:30,reps:10},{t:'working',load:30,reps:8},{t:'bodyweight',reps:18}]},
    {exId:'tricep_pushdown',sets:[{t:'working',load:42.8,reps:4},{t:'drop',load:38.3,reps:11,note:'rep PB'}]},
    {exId:'decline_cable_fly',sets:[{t:'working',load:13.6,reps:11}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:6}]},
    {exId:'isolateral_pull',sets:[{t:'working',load:170,reps:7}]},
    {exId:'pullups',sets:[{t:'bodyweight',reps:12}]},
    {exId:'pullups_weighted',sets:[{t:'working',load:5,reps:9}]},
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:5,note:'R side'},{t:'unilateral',load:27.5,r:9,l:4}]},
    {exId:'bicep_cable_curl',sets:[{t:'working',load:15.9,reps:8}]},
    {exId:'wide_row',sets:[{t:'working',load:75,reps:4},{t:'working',load:70,reps:6}]},
    {exId:'preacher_curl',sets:[{t:'working',load:100,reps:7}]},
    {exId:'reverse_curl',sets:[{t:'working',load:96,reps:7},{t:'working',load:96,reps:6},{t:'drop',load:82,reps:3}]},
    {exId:'shoulder_press',sets:[{t:'working',load:50,reps:2},{t:'working',load:45,reps:6}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:10}]},
    {exId:'reverse_fly',sets:[{t:'working',load:107,reps:6}]},
    {exId:'plank',sets:[{t:'duration',dur:2}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:3},{t:'duration',dur:3}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:11.3,r:7,l:7}]},
    {exId:'neutral_crunch',sets:[{t:'reps_only',reps:20}]},
    {exId:'lunge',sets:[{t:'working',load:50,reps:14}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:90,reps:7}]},
    {exId:'glute_bridge',sets:[{t:'working',load:140,reps:13}]},
    {exId:'back_extension',sets:[{t:'working',load:10,reps:16},{t:'bodyweight',reps:20}]},
    {exId:'isolateral_pulldown',sets:[{t:'working',load:180,reps:11}]},
    {exId:'cardio',sets:[{t:'duration',dur:25}]},
    {exId:'walk',sets:[{t:'duration',dur:15}]},
  ]},
  {id:'h_16mar',date:'2025-03-16',name:'Pull A',exercises:[
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:5},{t:'unilateral',load:27.5,r:4,l:4},{t:'unilateral',load:27.5,r:3,l:3}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:6},{t:'working',load:107,reps:4},{t:'drop',load:86,reps:4}]},
    {exId:'pullups_weighted',sets:[{t:'working',load:5,reps:9},{t:'working',load:5,reps:7}]},
  ]},
  {id:'h_22mar',date:'2025-03-22',name:'Pull B',exercises:[
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:4},{t:'unilateral',load:27.5,r:4,l:3}]},
    {exId:'wide_row',sets:[{t:'working',load:70,reps:6},{t:'working',load:70,reps:4},{t:'working',load:70,reps:4}]},
    {exId:'bench_press',sets:[{t:'working',load:90,reps:5},{t:'working',load:90,reps:5},{t:'working',load:80,reps:8}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:5},{t:'working',load:107,reps:3}]},
  ]},
  {id:'h_23mar',date:'2025-03-23',name:'Push A',exercises:[
    {exId:'incline_press',sets:[{t:'working',load:80,reps:4},{t:'working',load:80,reps:4},{t:'drop',load:60,reps:8}]},
    {exId:'tricep_pushdown',sets:[{t:'working',load:42.8,reps:9},{t:'working',load:42.8,reps:4}]},
    {exId:'tricep_pushdown_crossbody',sets:[{t:'unilateral',load:11.3,r:5,l:4},{t:'unilateral',load:11.3,r:4,l:3}]},
    {exId:'isolateral_pulldown',sets:[{t:'working',load:180,reps:10},{t:'working',load:180,reps:9,note:'move up next'}]},
  ]},
  {id:'h_24mar',date:'2025-03-24',name:'Legs',exercises:[
    {exId:'lunge',sets:[{t:'working',load:50,reps:14},{t:'working',load:50,reps:8}]},
    {exId:'glute_bridge',sets:[{t:'working',load:130,reps:15},{t:'working',load:140,reps:13}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:90,reps:7},{t:'working',load:90,reps:4},{t:'drop',load:86,reps:3}]},
    {exId:'back_extension',sets:[{t:'working',load:20,reps:9},{t:'bodyweight',reps:19}]},
  ]},
  {id:'h_26mar',date:'2025-03-26',name:'Push A',exercises:[
    {exId:'bench_press',sets:[{t:'warmup',load:60,reps:8},{t:'working',load:90,reps:5},{t:'working',load:90,reps:4}]},
    {exId:'decline_press',sets:[{t:'working',load:110,reps:5,note:'new load'},{t:'working',load:110,reps:3}]},
  ]},
  {id:'h_27mar',date:'2025-03-27',name:'Push + Shoulders',exercises:[
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:8},{t:'working',load:107,reps:6},{t:'drop',load:86,reps:6}]},
    {exId:'tricep_dips',sets:[{t:'working',load:35,reps:5,note:'+5kg jump'},{t:'working',load:35,reps:5}]},
    {exId:'lateral_raise',sets:[{t:'working',load:9.1,reps:11},{t:'working',load:9.1,reps:5}]},
  ]},
  {id:'h_28mar',date:'2025-03-28',name:'Pull A + Abs',exercises:[
    {exId:'wide_row',sets:[{t:'working',load:75,reps:4},{t:'working',load:70,reps:6},{t:'working',load:60,reps:6}]},
    {exId:'plank',sets:[{t:'duration',dur:2},{t:'duration',dur:1.5,note:'elongated'}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:2.25},{t:'duration',dur:3}]},
    {exId:'pullups_weighted',sets:[{t:'working',load:10,reps:7,note:'load jump'},{t:'working',load:10,reps:6}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:11.3,r:7,l:7},{t:'unilateral_load',load:11.3,r:5,l:5},{t:'unilateral_load',load:9.1,r:7,l:5}]},
  ]},
  {id:'h_29mar',date:'2025-03-29',name:'Pull A + Shoulders',exercises:[
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:4},{t:'unilateral',load:27.5,r:6,l:2},{t:'unilateral',load:27.5,r:4,l:3,note:'assisted'}]},
    {exId:'shoulder_press',sets:[{t:'working',load:50,reps:3},{t:'working',load:45,reps:6},{t:'working',load:45,reps:7}]},
    {exId:'preacher_curl',sets:[{t:'working',load:100,reps:7},{t:'working',load:100,reps:10}]},
  ]},
  {id:'h_30mar',date:'2025-03-30',name:'Push A',exercises:[
    {exId:'tricep_dips',sets:[{t:'working',load:35,reps:7},{t:'working',load:35,reps:4},{t:'bodyweight',reps:16}]},
    {exId:'wide_row',sets:[{t:'working',load:75,reps:4},{t:'working',load:70,reps:4},{t:'working',load:70,reps:4}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:5},{t:'working',load:107,reps:3}]},
  ]},
  {id:'h_1apr',date:'2025-04-01',name:'Push A',exercises:[
    {exId:'incline_press',sets:[{t:'warmup',load:60,reps:6},{t:'working',load:80,reps:6},{t:'working',load:80,reps:6},{t:'drop',load:60,reps:6}]},
    {exId:'tricep_pushdown',sets:[{t:'working',load:43.1,reps:6},{t:'working',load:43.1,reps:4},{t:'drop',load:36.3,reps:2}]},
    {exId:'bench_press',sets:[{t:'warmup',load:60,reps:6},{t:'working',load:90,reps:0,note:'shoulder cooked'}]},
  ]},
  {id:'h_2apr',date:'2025-04-02',name:'Legs',exercises:[
    {exId:'lunge',sets:[{t:'working',load:50,reps:14},{t:'working',load:50,reps:9},{t:'working',load:50,reps:7}]},
    {exId:'prone_leg_curl',sets:[{t:'working',load:90,reps:5},{t:'working',load:90,reps:4},{t:'drop',load:81,reps:4}]},
    {exId:'back_extension',sets:[{t:'working',load:10,reps:15},{t:'working',load:10,reps:15}]},
    {exId:'glute_bridge',sets:[{t:'working',load:160,reps:7,note:'new load'},{t:'working',load:160,reps:4}]},
    {exId:'cardio',sets:[{t:'duration',dur:7,note:'6km 15% incline'}]},
  ]},
  {id:'h_3apr',date:'2025-04-03',name:'Pull B',exercises:[
    {exId:'bicep_curl',sets:[{t:'working',load:30,r:5},{t:'unilateral',load:27.5,r:5,l:3},{t:'unilateral',load:27.5,r:5,l:3}]},
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:0,note:'reps not logged'}]},
    {exId:'preacher_curl',sets:[{t:'working',load:100,reps:7},{t:'working',load:100,reps:10}]},
  ]},
  {id:'h_4apr',date:'2025-04-04',name:'Pull B + Abs',exercises:[
    {exId:'short_neutral_pulldown',sets:[{t:'working',load:107,reps:6},{t:'working',load:107,reps:3},{t:'drop',load:86,reps:3}]},
    {exId:'wide_row',sets:[{t:'working',load:70,reps:5},{t:'working',load:70,reps:4}]},
    {exId:'plank',sets:[{t:'duration',dur:2.5}]},
    {exId:'bird_dog',sets:[{t:'duration',dur:3},{t:'duration',dur:3}]},
    {exId:'pallof_press',sets:[{t:'unilateral_load',load:11.3,r:10,l:10},{t:'unilateral_load',load:11.3,r:10,l:9},{t:'unilateral_load',load:9.1,r:8,l:9}]},
  ]},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,9);
const todayStr = () => new Date().toISOString().split('T')[0];
const fmtDate = d => new Date(d+'T12:00:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});
const fmtLoad = (load,type) => {
  if(type==='bodyweight') return 'BW';
  if(type==='weighted_bw') return `+${load}kg`;
  if(!load&&load!==0) return '—';
  return `${load}kg`;
};
const pad2 = n => String(Math.floor(n)).padStart(2,'0');

function getTopSets(sessions, exId) {
  const pts=[];
  sessions.forEach(s=>{
    const block=s.exercises?.find(e=>e.exId===exId);
    if(!block) return;
    const working=block.sets.filter(x=>x.t==='working'&&(x.reps>0||x.r>0));
    if(!working.length) return;
    const top=working.reduce((a,b)=>(Math.max(a.reps||a.r||0)>=Math.max(b.reps||b.r||0)?a:b));
    pts.push({date:s.date,reps:top.reps||top.r||0,load:top.load});
  });
  return pts.sort((a,b)=>a.date>b.date?1:-1);
}

function computeMacros(dayItems,foodLib) {
  let cal=0,prot=0,carb=0,fat=0;
  dayItems.forEach(item=>{
    const f=foodLib.find(x=>x.id===item.foodId); if(!f) return;
    const q=item.qty||1;
    cal+=(f.cal||0)*q; prot+=(f.prot||0)*q; carb+=(f.carb||0)*q; fat+=(f.fat||0)*q;
  });
  return {cal:Math.round(cal),prot:Math.round(prot*10)/10,carb:Math.round(carb),fat:Math.round(fat)};
}

async function loadStore(key,fb){try{const r=await window.storage.get(key);return r?JSON.parse(r.value):fb;}catch{return fb;}}
async function saveStore(key,val){try{await window.storage.set(key,JSON.stringify(val));}catch{}}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const Pill=({label,color,bg})=>(
  <span style={{fontSize:11,fontWeight:500,padding:'2px 7px',borderRadius:20,background:bg||'#F1EFE8',color:color||'#5F5E5A',whiteSpace:'nowrap'}}>{label}</span>
);
const MacroBar=({label,val,target,color})=>{
  const pct=Math.min(100,Math.round((val/target)*100));
  const over=val>target;
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
        <span style={{color:'var(--color-text-secondary)'}}>{label}</span>
        <span style={{fontWeight:500,color:over?'#E24B4A':'var(--color-text-primary)'}}>{val} / {target}{over?` (+${val-target})`:` (−${target-val})`}</span>
      </div>
      <div style={{height:6,background:'var(--color-background-secondary)',borderRadius:3,overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:over?'#E24B4A':color,borderRadius:3}}/>
      </div>
    </div>
  );
};
const Btn=({children,onClick,primary,small,danger,disabled,full})=>(
  <button onClick={onClick} disabled={disabled} style={{
    padding:small?'5px 12px':'8px 16px',fontSize:small?12:13,fontWeight:500,
    background:primary?'var(--color-text-primary)':danger?'#FCEBEB':'var(--color-background-secondary)',
    color:primary?'var(--color-background-primary)':danger?'#A32D2D':'var(--color-text-primary)',
    border:`0.5px solid ${danger?'#F0959599':primary?'transparent':'var(--color-border-secondary)'}`,
    borderRadius:'var(--border-radius-md)',cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1,
    width:full?'100%':'auto',display:'block',
  }}>{children}</button>
);
const Inp=({value,onChange,placeholder,type='text',style={}})=>(
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{padding:'7px 10px',fontSize:13,border:'0.5px solid var(--color-border-secondary)',
    borderRadius:'var(--border-radius-md)',background:'var(--color-background-primary)',
    color:'var(--color-text-primary)',width:'100%',boxSizing:'border-box',...style}}/>
);
const Sel=({value,onChange,options})=>(
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{padding:'7px 10px',fontSize:13,border:'0.5px solid var(--color-border-secondary)',
    borderRadius:'var(--border-radius-md)',background:'var(--color-background-primary)',
    color:'var(--color-text-primary)',width:'100%',boxSizing:'border-box'}}>
    {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
  </select>
);

// ─── SESSION TIMER ────────────────────────────────────────────────────────────
function SessionTimer({startTs}) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now()-startTs)/1000));
  useEffect(()=>{
    const id=setInterval(()=>setElapsed(Math.floor((Date.now()-startTs)/1000)),1000);
    return ()=>clearInterval(id);
  },[startTs]);
  const mins=Math.floor(elapsed/60);
  const secs=elapsed%60;
  const bg = mins>=60?'#FCEBEB':mins>=50?'#FAEEDA':'var(--color-background-secondary)';
  const col = mins>=60?'#A32D2D':mins>=50?'#854F0B':'var(--color-text-primary)';
  const warn = mins>=60?'⚠ OVER 60min':mins>=50?`⏱ ${60-mins}min left`:'';
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,background:bg,borderRadius:'var(--border-radius-md)',padding:'6px 12px',transition:'background .5s'}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:18,fontWeight:500,color:col,letterSpacing:2}}>
        {pad2(mins)}:{pad2(secs)}
      </span>
      {warn&&<span style={{fontSize:11,fontWeight:500,color:col}}>{warn}</span>}
    </div>
  );
}

// ─── CARDIO LOGGER ────────────────────────────────────────────────────────────
function CardioLogger({cardio, setCardio}) {
  const done = cardio?.logged;
  const dur = cardio?.dur||'';
  const incline = cardio?.incline||'';
  const speed = cardio?.speed||'';
  const note = cardio?.note||'';
  const meetsTarget = parseFloat(dur||0)>=20;

  return (
    <div style={{background:done?'#EAF3DE':meetsTarget?'#EAF3DE':'#FAEEDA',border:`0.5px solid ${done?'#97C459':'#EF9F27'}`,borderRadius:'var(--border-radius-lg)',padding:'12px 14px',marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:done?0:10}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:done?'#639922':'#EF9F27'}}/>
        <span style={{fontWeight:500,fontSize:13,flex:1}}>Mandatory cardio — 20 min</span>
        {done&&<Pill label="✓ logged" color="#3B6D11" bg="#EAF3DE"/>}
        {!done&&!meetsTarget&&<Pill label="required" color="#854F0B" bg="#FAEEDA"/>}
        {!done&&meetsTarget&&<Pill label="ready to log" color="#3B6D11" bg="#EAF3DE"/>}
      </div>
      {!done&&(
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
          <div style={{flex:1,minWidth:70}}>
            <div style={{fontSize:10,color:'var(--color-text-secondary)',marginBottom:2}}>Duration (min)*</div>
            <Inp value={dur} onChange={v=>setCardio(c=>({...c,dur:v}))} placeholder="20" type="number"/>
          </div>
          <div style={{flex:1,minWidth:70}}>
            <div style={{fontSize:10,color:'var(--color-text-secondary)',marginBottom:2}}>Incline (%)</div>
            <Inp value={incline} onChange={v=>setCardio(c=>({...c,incline:v}))} placeholder="e.g. 12" type="number"/>
          </div>
          <div style={{flex:1,minWidth:70}}>
            <div style={{fontSize:10,color:'var(--color-text-secondary)',marginBottom:2}}>Speed (km/h)</div>
            <Inp value={speed} onChange={v=>setCardio(c=>({...c,speed:v}))} placeholder="e.g. 6.0" type="number"/>
          </div>
        </div>
      )}
      {!done&&(
        <div style={{display:'flex',gap:6}}>
          <div style={{flex:1}}><Inp value={note} onChange={v=>setCardio(c=>({...c,note:v}))} placeholder="notes (treadmill, incline walk, etc.)"/></div>
          <Btn primary onClick={()=>setCardio(c=>({...c,logged:true,dur,incline,speed,note}))}>Log ✓</Btn>
        </div>
      )}
      {done&&(
        <div style={{marginTop:6,fontSize:12,color:'#3B6D11'}}>
          {dur}min {incline?`· ${incline}% incline`:''} {speed?`· ${speed}km/h`:''} {note?`· ${note}`:''}
          <button onClick={()=>setCardio(c=>({...c,logged:false}))} style={{marginLeft:8,fontSize:11,color:'var(--color-text-tertiary)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>edit</button>
        </div>
      )}
    </div>
  );
}

// ─── SET LOGGER ───────────────────────────────────────────────────────────────
function SetLogger({exType, onAdd}) {
  const [t,setT]=useState('working');
  const [load,setLoad]=useState('');const [reps,setReps]=useState('');
  const [rR,setRR]=useState('');const [rL,setRL]=useState('');
  const [dur,setDur]=useState('');const [note,setNote]=useState('');

  const isDur=exType==='duration';
  const isUni=exType==='unilateral'||exType==='unilateral_load';
  const isBW=exType==='bodyweight';
  const isRO=exType==='reps_only';

  const doAdd=()=>{
    const s={t};
    if(isDur){s.dur=parseFloat(dur)||0;}
    else if(isRO){s.reps=parseInt(reps)||0;}
    else if(isUni){if(exType==='unilateral_load'||t==='unilateral_load')s.load=parseFloat(load)||0;s.r=parseInt(rR)||0;s.l=parseInt(rL)||0;}
    else if(isBW){s.reps=parseInt(reps)||0;}
    else{s.load=parseFloat(load)||0;if(t==='working'&&exType==='unilateral')s.r=parseInt(rR)||0;else s.reps=parseInt(reps)||0;}
    if(note.trim())s.note=note.trim();
    onAdd(s);
    setLoad('');setReps('');setRR('');setRL('');setDur('');setNote('');
  };

  const typeOpts=isDur?[{value:'duration',label:'Duration'}]:isRO?[{value:'reps_only',label:'Reps'}]:[
    {value:'working',label:'Working'},{value:'warmup',label:'Warmup'},{value:'drop',label:'Drop set'},{value:'bodyweight',label:'BW'},
  ];

  return(
    <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'10px 12px',marginTop:8}}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
        <div style={{flex:1,minWidth:90}}><Sel value={t} onChange={setT} options={typeOpts}/></div>
        {!isDur&&!isRO&&!isBW&&<div style={{flex:1,minWidth:65}}><Inp value={load} onChange={setLoad} placeholder={exType==='weighted_bw'?'+kg':'kg'} type="number"/></div>}
        {isDur&&<div style={{flex:1,minWidth:65}}><Inp value={dur} onChange={setDur} placeholder="mins" type="number"/></div>}
        {!isDur&&!isUni&&<div style={{flex:1,minWidth:50}}><Inp value={reps} onChange={setReps} placeholder="reps" type="number"/></div>}
        {isUni&&<><div style={{flex:1,minWidth:45}}><Inp value={rR} onChange={setRR} placeholder="R" type="number"/></div><div style={{flex:1,minWidth:45}}><Inp value={rL} onChange={setRL} placeholder="L" type="number"/></div></>}
        {exType==='unilateral_load'&&<><div style={{flex:1,minWidth:45}}><Inp value={rR} onChange={setRR} placeholder="R" type="number"/></div><div style={{flex:1,minWidth:45}}><Inp value={rL} onChange={setRL} placeholder="L" type="number"/></div></>}
      </div>
      <div style={{display:'flex',gap:6}}>
        <div style={{flex:1}}><Inp value={note} onChange={setNote} placeholder="note (optional)"/></div>
        <Btn primary onClick={doAdd}>+ Set</Btn>
      </div>
    </div>
  );
}

function ExBlock({block,exLib,onAddSet}) {
  const ex=exLib.find(e=>e.id===block.exId); if(!ex) return null;
  const [open,setOpen]=useState(true);
  const setTypeStyle=(s)=>{
    if(s.t==='working')return{label:'W',color:'#0C447C',bg:'#E6F1FB'};
    if(s.t==='warmup')return{label:'WU',color:'#3B6D11',bg:'#EAF3DE'};
    if(s.t==='drop')return{label:'D',color:'#993C1D',bg:'#FAECE7'};
    if(s.t==='bodyweight')return{label:'BW',color:'#5F5E5A',bg:'#F1EFE8'};
    if(s.t==='duration')return{label:'⏱',color:'#185FA5',bg:'#E6F1FB'};
    return{label:'—',color:'#888',bg:'#F1EFE8'};
  };
  const renderSet=(s,i)=>{
    const st=setTypeStyle(s);
    return(
      <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0',borderBottom:'0.5px solid var(--color-border-tertiary)',fontSize:12}}>
        <Pill label={st.label} color={st.color} bg={st.bg}/>
        <span style={{flex:1}}>
          {s.t==='duration'&&`${s.dur} min`}
          {s.t==='reps_only'&&`${s.reps} reps`}
          {(s.t==='unilateral'||s.t==='unilateral_load')&&`R${s.r}/L${s.l}${s.load?` @ ${s.load}kg`:''}`}
          {(s.t==='working'||s.t==='warmup'||s.t==='drop')&&s.r!==undefined&&`R${s.r}${s.load?' @ '+fmtLoad(s.load,ex.type):''}`}
          {(s.t==='working'||s.t==='warmup'||s.t==='drop')&&s.reps!==undefined&&`${s.reps} reps${s.load?' @ '+fmtLoad(s.load,ex.type):''}`}
          {s.t==='bodyweight'&&`${s.reps} reps BW`}
        </span>
        {s.note&&<span style={{fontSize:10,color:'var(--color-text-tertiary)',fontStyle:'italic'}}>{s.note}</span>}
      </div>
    );
  };
  return(
    <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',marginBottom:8,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',cursor:'pointer'}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:CAT_COLOR[ex.cat]||'#888',flexShrink:0}}/>
        <span style={{flex:1,fontWeight:500,fontSize:13}}>{ex.name}</span>
        <span style={{fontSize:12,color:'var(--color-text-tertiary)',fontFamily:'var(--font-mono)'}}>{block.sets.length} sets</span>
        <Pill label={ex.cat} color={CAT_COLOR[ex.cat]} bg={CAT_BG[ex.cat]}/>
        <span style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{open?'▲':'▼'}</span>
      </div>
      {open&&<div style={{padding:'0 14px 14px'}}>
        {block.sets.map(renderSet)}
        <SetLogger exType={ex.type} onAdd={s=>onAddSet(block.exId,s)}/>
      </div>}
    </div>
  );
}

// ─── ACTIVE SESSION ───────────────────────────────────────────────────────────
function ActiveSession({session,setSession,exLib,onFinish,onCancel}) {
  const [showPicker,setShowPicker]=useState(false);
  const [search,setSearch]=useState('');
  const [filterCat,setFilterCat]=useState('all');
  const [cardio,setCardio]=useState(session.cardio||{logged:false,dur:'',incline:'',speed:'',note:''});

  const filtered=exLib.filter(e=>{
    const ms=e.name.toLowerCase().includes(search.toLowerCase());
    const mc=filterCat==='all'||e.cat===filterCat;
    return ms&&mc;
  });

  const handleAddSet=(exId,set)=>setSession(s=>{
    const exs=s.exercises.map(b=>b.exId===exId?{...b,sets:[...b.sets,set]}:b);
    return{...s,exercises:exs};
  });
  const handleAddEx=(exId)=>{
    if(session.exercises.some(b=>b.exId===exId)) return;
    setSession(s=>({...s,exercises:[...s.exercises,{exId,sets:[]}]}));
    setShowPicker(false);setSearch('');
  };
  const handleFinish=()=>{
    const final={...session,cardio};
    if(!cardio.logged&&parseFloat(cardio.dur||0)<20){
      if(!window.confirm('Cardio not logged / under 20min. Finish anyway?')) return;
    }
    onFinish(final);
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:500,fontSize:15}}>{session.name}</div>
          <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{fmtDate(session.date)}</div>
        </div>
        <SessionTimer startTs={session.startTs}/>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        <Btn small onClick={onCancel} danger>✕ Discard</Btn>
        <Btn primary small onClick={handleFinish}>✓ Finish</Btn>
      </div>

      {/* Exercises */}
      {session.exercises.map(block=>(
        <ExBlock key={block.exId} block={block} exLib={exLib} onAddSet={handleAddSet}/>
      ))}

      {/* Add exercise picker */}
      {showPicker?(
        <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-secondary)',borderRadius:'var(--border-radius-lg)',padding:12,marginBottom:10}}>
          <div style={{display:'flex',gap:6,marginBottom:8}}>
            <div style={{flex:1}}><Inp value={search} onChange={setSearch} placeholder="Search…"/></div>
            <Btn small onClick={()=>{setShowPicker(false);setSearch('');}}>✕</Btn>
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
            {['all','chest','back','shoulders','biceps','triceps','legs','core','cardio'].map(c=>(
              <span key={c} onClick={()=>setFilterCat(c)} style={{fontSize:10,padding:'3px 8px',borderRadius:20,cursor:'pointer',fontWeight:filterCat===c?500:400,
                background:filterCat===c?(CAT_BG[c]||'#F1EFE8'):'var(--color-background-secondary)',
                color:filterCat===c?(CAT_COLOR[c]||'#5F5E5A'):'var(--color-text-secondary)'}}>
                {c}
              </span>
            ))}
          </div>
          <div style={{maxHeight:180,overflowY:'auto'}}>
            {filtered.map(e=>{
              const added=session.exercises.some(b=>b.exId===e.id);
              return(
                <div key={e.id} onClick={()=>!added&&handleAddEx(e.id)}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:'var(--border-radius-md)',cursor:added?'default':'pointer',opacity:added?.4:1}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:CAT_COLOR[e.cat]}}/>
                  <span style={{flex:1,fontSize:13}}>{e.name}</span>
                  {added&&<span style={{fontSize:10,color:'var(--color-text-tertiary)'}}>added</span>}
                </div>
              );
            })}
          </div>
        </div>
      ):(
        <div onClick={()=>setShowPicker(true)} style={{border:'0.5px dashed var(--color-border-secondary)',borderRadius:'var(--border-radius-lg)',padding:12,textAlign:'center',cursor:'pointer',color:'var(--color-text-secondary)',fontSize:13,marginBottom:10}}>
          + Add exercise
        </div>
      )}

      {/* Mandatory cardio */}
      <CardioLogger cardio={cardio} setCardio={setCardio}/>
    </div>
  );
}

// ─── WORKOUT TAB ──────────────────────────────────────────────────────────────
function WorkoutTab({sessions,setSessions,exLib,activeSession,setActiveSession}) {
  const [view,setView]=useState('list');
  const [selected,setSelected]=useState(null);
  const [newName,setNewName]=useState('');
  const [newSplit,setNewSplit]=useState('');

  const sorted=[...sessions].sort((a,b)=>b.date>a.date?1:-1);

  function startNew(){
    const split=SPLITS.find(s=>s.name===newSplit);
    const sess={
      id:uid(),date:todayStr(),
      name:newName.trim()||newSplit||'Workout',
      startTs:Date.now(),
      exercises:split?split.exIds.map(id=>({exId:id,sets:[]})):[],
      cardio:{logged:false,dur:'',incline:'',speed:'',note:''},
    };
    setActiveSession(sess);setView('log');
  }

  function handleFinish(final){
    const next=[...sessions,final];
    setSessions(next);setActiveSession(null);
    saveStore('sessions',next);setView('list');
  }

  if(activeSession&&view==='log') return(
    <ActiveSession session={activeSession} setSession={setActiveSession} exLib={exLib}
      onFinish={handleFinish} onCancel={()=>{setActiveSession(null);setView('list');}}/>
  );

  if(view==='detail'&&selected) return <SessionDetail session={selected} exLib={exLib} onBack={()=>setView('list')}/>;

  if(view==='new') return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <Btn small onClick={()=>setView('list')}>← Back</Btn>
        <span style={{fontWeight:500,fontSize:15}}>New session</span>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:12,color:'var(--color-text-secondary)',marginBottom:3}}>Session name</div>
        <Inp value={newName} onChange={setNewName} placeholder="e.g. Push A"/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:'var(--color-text-secondary)',marginBottom:3}}>Load split template</div>
        <Sel value={newSplit} onChange={v=>{setNewSplit(v);if(!newName.trim())setNewName(v);}}
          options={[{value:'',label:'— Blank session —'},...SPLITS.map(s=>({value:s.name,label:s.name}))]}/>
      </div>
      {newSplit&&SPLITS.find(s=>s.name===newSplit)?.benchmarks&&(
        <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'10px 12px',marginBottom:14,fontSize:12}}>
          <div style={{fontWeight:500,marginBottom:6,color:'var(--color-text-secondary)'}}>Current benchmarks</div>
          {Object.entries(SPLITS.find(s=>s.name===newSplit).benchmarks).map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'2px 0',color:'var(--color-text-secondary)'}}>
              <span>{exLib.find(e=>e.id===k)?.name||k}</span>
              <span style={{fontWeight:500,color:'var(--color-text-primary)',fontFamily:'var(--font-mono)',fontSize:11}}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <Btn primary onClick={startNew} full>Start session →</Btn>
    </div>
  );

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontWeight:500,fontSize:15}}>{sessions.length} sessions</span>
        <Btn primary small onClick={()=>setView('new')}>+ New</Btn>
      </div>

      {/* Weekly split guide */}
      <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'10px 12px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:500,color:'var(--color-text-tertiary)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>Weekly structure</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,fontSize:10,textAlign:'center'}}>
          {[['Mon','Push'],['Tue','Pull'],['Wed','Abs'],['Thu','Shoulders'],['Fri','Legs'],['Sat','Rest']].map(([d,n])=>(
            <div key={d} style={{padding:'4px 2px'}}>
              <div style={{color:'var(--color-text-tertiary)',marginBottom:2}}>{d}</div>
              <div style={{fontWeight:500,color:'var(--color-text-secondary)',fontSize:9}}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      {sorted.map(s=>{
        const cats=[...new Set((s.exercises||[]).map(e=>{const ex=exLib.find(x=>x.id===e.exId);return ex?.cat;}).filter(Boolean))];
        const totalSets=(s.exercises||[]).reduce((a,b)=>a+(b.sets?.length||0),0);
        const cardioOk=s.cardio?.logged||parseFloat(s.cardio?.dur||0)>=20;
        return(
          <div key={s.id} onClick={()=>{setSelected(s);setView('detail');}}
            style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'11px 14px',marginBottom:8,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{s.name}</div>
                <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{fmtDate(s.date)} · {totalSets} sets</div>
                {s.note&&<div style={{fontSize:10,color:'var(--color-text-tertiary)',fontStyle:'italic',marginTop:2}}>{s.note}</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <div style={{display:'flex',gap:3,flexWrap:'wrap',justifyContent:'flex-end'}}>
                  {cats.slice(0,3).map(c=><Pill key={c} label={c} color={CAT_COLOR[c]} bg={CAT_BG[c]}/>)}
                </div>
                {s.cardio&&<Pill label={cardioOk?'✓ cardio':'! cardio'} color={cardioOk?'#3B6D11':'#993C1D'} bg={cardioOk?'#EAF3DE':'#FAECE7'}/>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SessionDetail({session,exLib,onBack}) {
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <Btn small onClick={onBack}>← Back</Btn>
        <div>
          <div style={{fontWeight:500,fontSize:15}}>{session.name}</div>
          <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{fmtDate(session.date)}</div>
        </div>
      </div>
      {session.note&&<div style={{fontSize:12,color:'var(--color-text-secondary)',fontStyle:'italic',marginBottom:12,padding:'8px 12px',background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)'}}>{session.note}</div>}
      {session.cardio?.logged&&(
        <div style={{background:'#EAF3DE',borderRadius:'var(--border-radius-md)',padding:'8px 12px',marginBottom:12,fontSize:12,color:'#3B6D11'}}>
          ✓ Cardio: {session.cardio.dur}min
          {session.cardio.incline&&` · ${session.cardio.incline}% incline`}
          {session.cardio.speed&&` · ${session.cardio.speed}km/h`}
          {session.cardio.note&&` · ${session.cardio.note}`}
        </div>
      )}
      {(session.exercises||[]).map(block=>{
        const ex=exLib.find(e=>e.id===block.exId); if(!ex) return null;
        return(
          <div key={block.exId} style={{marginBottom:10,background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:CAT_COLOR[ex.cat]}}/>
              <span style={{fontWeight:500,fontSize:13,flex:1}}>{ex.name}</span>
              <Pill label={ex.cat} color={CAT_COLOR[ex.cat]} bg={CAT_BG[ex.cat]}/>
            </div>
            <div style={{padding:'8px 14px'}}>
              {block.sets.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0',fontSize:12,borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
                  <Pill label={s.t==='working'?'W':s.t==='warmup'?'WU':s.t==='drop'?'D':s.t==='bodyweight'?'BW':'—'}
                    color={s.t==='working'?'#0C447C':s.t==='drop'?'#993C1D':'#5F5E5A'}
                    bg={s.t==='working'?'#E6F1FB':s.t==='drop'?'#FAECE7':'#F1EFE8'}/>
                  <span style={{flex:1}}>
                    {s.t==='duration'&&`${s.dur} min`}
                    {s.t==='reps_only'&&`${s.reps} reps`}
                    {(s.t==='unilateral'||s.t==='unilateral_load')&&`R${s.r}/L${s.l}${s.load?` @ ${s.load}kg`:''}`}
                    {(s.t==='working'||s.t==='warmup'||s.t==='drop')&&s.r!==undefined&&`R${s.r}${s.load?' @ '+fmtLoad(s.load,ex.type):''}`}
                    {(s.t==='working'||s.t==='warmup'||s.t==='drop')&&s.reps!==undefined&&`${s.reps} reps${s.load?' @ '+fmtLoad(s.load,ex.type):''}`}
                    {s.t==='bodyweight'&&`${s.reps} reps BW`}
                  </span>
                  {s.note&&<span style={{fontSize:10,color:'var(--color-text-tertiary)',fontStyle:'italic'}}>{s.note}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────
function NutritionTab({foodLib,setFoodLib,mealTemplates,nutLog,setNutLog,selDate,setSelDate}) {
  const [view,setView]=useState('day');
  const [qs,setQs]=useState('');
  const dayKey=selDate;
  const dayItems=nutLog[dayKey]||[];
  const macros=computeMacros(dayItems,foodLib);

  const addItem=(foodId,qty=1)=>setNutLog(prev=>{
    const items=[...(prev[dayKey]||[]),{id:uid(),foodId,qty}];
    const next={...prev,[dayKey]:items};saveStore('nutLog',next);return next;
  });
  const removeItem=(itemId)=>setNutLog(prev=>{
    const items=(prev[dayKey]||[]).filter(x=>x.id!==itemId);
    const next={...prev,[dayKey]:items};saveStore('nutLog',next);return next;
  });
  const updateQty=(itemId,qty)=>setNutLog(prev=>{
    const items=(prev[dayKey]||[]).map(x=>x.id===itemId?{...x,qty:parseFloat(qty)||1}:x);
    const next={...prev,[dayKey]:items};saveStore('nutLog',next);return next;
  });
  const addMeal=(tmpl)=>tmpl.items.forEach(item=>addItem(item.foodId,item.qty));

  if(view==='library') return <FoodLib foods={foodLib} setFoodLib={setFoodLib} onBack={()=>setView('day')} onSel={id=>{addItem(id);setView('day');}}/>;
  if(view==='templates') return <MealTemplates templates={mealTemplates} foods={foodLib} onBack={()=>setView('day')} onUse={t=>addMeal(t)}/>;

  const filtFoods=foodLib.filter(f=>f.name.toLowerCase().includes(qs.toLowerCase()));

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <Btn small onClick={()=>{const d=new Date(selDate+'T12:00:00');d.setDate(d.getDate()-1);setSelDate(d.toISOString().split('T')[0]);}}>‹</Btn>
        <div style={{flex:1,textAlign:'center',fontWeight:500,fontSize:14}}>{fmtDate(selDate)}</div>
        <Btn small onClick={()=>{const d=new Date(selDate+'T12:00:00');d.setDate(d.getDate()+1);setSelDate(d.toISOString().split('T')[0]);}}>›</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:10}}>
        {[['Cal',macros.cal,'kcal'],['Protein',macros.prot,'g'],['Carbs',macros.carb,'g'],['Fat',macros.fat,'g']].map(([l,v,u])=>(
          <div key={l} style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'8px',textAlign:'center'}}>
            <div style={{fontSize:17,fontWeight:500}}>{v}</div>
            <div style={{fontSize:9,color:'var(--color-text-secondary)'}}>{l} {u}</div>
          </div>
        ))}
      </div>
      <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'10px 14px',marginBottom:12}}>
        <MacroBar label="Calories" val={macros.cal} target={CAL_TARGET} color="#378ADD"/>
        <MacroBar label="Protein" val={macros.prot} target={PROT_TARGET} color="#1D9E75"/>
      </div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
        {mealTemplates.map(t=>(
          <Btn key={t.id} small onClick={()=>addMeal(t)}>+ {t.name}</Btn>
        ))}
        <Btn small onClick={()=>{addMeal(mealTemplates.find(m=>m.id==='yoghurt_snack'));addMeal(mealTemplates.find(m=>m.id==='yoghurt_snack'));}}>+ Snack ×2</Btn>
      </div>
      {dayItems.length===0&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',fontSize:13,padding:'20px 0'}}>Nothing logged yet.</div>}
      {dayItems.map(item=>{
        const f=foodLib.find(x=>x.id===item.foodId); if(!f) return null;
        return(
          <div key={item.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-md)',marginBottom:5}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
              <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{Math.round((f.cal||0)*item.qty)} kcal · {Math.round((f.prot||0)*item.qty*10)/10}g P</div>
            </div>
            <input type="number" value={item.qty} onChange={e=>updateQty(item.id,e.target.value)} min="0.25" step="0.25"
              style={{width:44,padding:'4px 5px',fontSize:12,border:'0.5px solid var(--color-border-secondary)',borderRadius:'var(--border-radius-md)',background:'var(--color-background-secondary)',color:'var(--color-text-primary)',textAlign:'center'}}/>
            <button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--color-text-tertiary)',padding:'2px 4px'}}>×</button>
          </div>
        );
      })}
      <div style={{marginTop:10}}>
        <Inp value={qs} onChange={setQs} placeholder="Quick add — search food…"/>
        {qs&&(
          <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-secondary)',borderRadius:'var(--border-radius-md)',marginTop:4}}>
            {filtFoods.slice(0,6).map(f=>(
              <div key={f.id} onClick={()=>{addItem(f.id);setQs('');}} style={{padding:'8px 12px',cursor:'pointer',borderBottom:'0.5px solid var(--color-border-tertiary)',fontSize:13}}>
                {f.name} <span style={{color:'var(--color-text-secondary)',fontSize:11}}>{f.cal}kcal · {f.prot}g P</span>
              </div>
            ))}
            {!filtFoods.length&&<div style={{padding:'8px 12px',fontSize:12,color:'var(--color-text-tertiary)'}}>No results</div>}
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <Btn onClick={()=>setView('library')}>Food library</Btn>
        <Btn onClick={()=>setView('templates')}>Templates</Btn>
      </div>
    </div>
  );
}

function FoodLib({foods,setFoodLib,onBack,onSel}){
  const [search,setSearch]=useState('');
  const [adding,setAdding]=useState(false);
  const [n,setN]=useState('');const [cal,setCal]=useState('');const [prot,setProt]=useState('');const [carb,setCarb]=useState('');const [fat,setFat]=useState('');const [serv,setServ]=useState('1 serving');const [est,setEst]=useState(false);
  const filtered=foods.filter(f=>f.name.toLowerCase().includes(search.toLowerCase()));
  const saveCustom=()=>{
    const f={id:uid(),name:n.trim(),cal:parseFloat(cal)||0,prot:parseFloat(prot)||0,carb:parseFloat(carb)||0,fat:parseFloat(fat)||0,serving:serv,estimated:est,exact:!est,custom:true};
    const next=[...foods,f];setFoodLib(next);saveStore('foodLib',next);setAdding(false);
    setN('');setCal('');setProt('');setCarb('');setFat('');setServ('1 serving');
  };
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <Btn small onClick={onBack}>← Back</Btn>
        <span style={{flex:1,fontWeight:500,fontSize:15}}>Food library</span>
        <Btn primary small onClick={()=>setAdding(a=>!a)}>+ Custom</Btn>
      </div>
      {adding&&(
        <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-lg)',padding:'12px',marginBottom:12}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            {[['Name',n,setN,'text','full row'],['Calories (kcal)',cal,setCal,'number',''],['Protein (g)',prot,setProt,'number',''],['Carbs (g)',carb,setCarb,'number',''],['Fat (g)',fat,setFat,'number',''],['Serving size',serv,setServ,'text','']].map(([l,v,s,t,w],i)=>(
              <div key={l} style={{gridColumn:w?'1/-1':'auto'}}>
                <div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>{l}</div>
                <Inp value={v} onChange={s} type={t}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <input type="checkbox" checked={est} onChange={e=>setEst(e.target.checked)} id="est"/>
            <label htmlFor="est" style={{fontSize:12}}>Mark as estimated</label>
          </div>
          <Btn primary onClick={saveCustom} disabled={!n.trim()}>Save food</Btn>
        </div>
      )}
      <div style={{marginBottom:8}}><Inp value={search} onChange={setSearch} placeholder="Search…"/></div>
      {filtered.map(f=>(
        <div key={f.id} onClick={()=>onSel(f.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-md)',marginBottom:5,cursor:'pointer'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
            <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{f.cal}kcal · P{f.prot}g · C{f.carb||'?'}g · F{f.fat||'?'}g</div>
            {f.estimated&&<Pill label="est." color="#993C1D" bg="#FAECE7"/>}
          </div>
          <span style={{color:'var(--color-text-tertiary)',fontSize:16}}>+</span>
        </div>
      ))}
    </div>
  );
}

function MealTemplates({templates,foods,onBack,onUse}){
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <Btn small onClick={onBack}>← Back</Btn>
        <span style={{flex:1,fontWeight:500,fontSize:15}}>Meal templates</span>
      </div>
      {templates.map(t=>{
        const m=computeMacros(t.items.map(i=>({foodId:i.foodId,qty:i.qty})),foods);
        return(
          <div key={t.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'12px 14px',marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontWeight:500,fontSize:14}}>{t.name}</span>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:12,color:'var(--color-text-secondary)'}}>{m.cal}kcal · {m.prot}g P</span>
                <Btn primary small onClick={()=>onUse(t)}>Add</Btn>
              </div>
            </div>
            {t.items.map(item=>{const f=foods.find(x=>x.id===item.foodId);return f&&<div key={item.foodId} style={{fontSize:12,color:'var(--color-text-secondary)',padding:'1px 0'}}>· {f.name} ×{item.qty}</div>;})}
          </div>
        );
      })}
    </div>
  );
}

// ─── LIBRARY TAB ──────────────────────────────────────────────────────────────
function LibraryTab({exLib,setExLib}){
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [adding,setAdding]=useState(false);
  const [n,setN]=useState('');const [cat,setCat]=useState('other');const [type,setType]=useState('bilateral');const [split,setSplit]=useState('');const [notes,setNotes]=useState('');

  const filtered=exLib.filter(e=>{
    const mc=filter==='all'||e.cat===filter;
    const ms=e.name.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  const save=()=>{
    const next=[...exLib,{id:uid(),name:n.trim(),cat,type,split,notes,custom:true}];
    setExLib(next);saveStore('exercises',next);
    setAdding(false);setN('');setCat('other');setType('bilateral');setSplit('');setNotes('');
  };

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <span style={{fontWeight:500,fontSize:15}}>{exLib.length} exercises</span>
        <Btn primary small onClick={()=>setAdding(a=>!a)}>+ Custom</Btn>
      </div>
      {adding&&(
        <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-lg)',padding:12,marginBottom:12}}>
          <div style={{marginBottom:8}}><div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>Name</div><Inp value={n} onChange={setN}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <div><div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>Category</div>
              <Sel value={cat} onChange={setCat} options={['chest','back','shoulders','biceps','triceps','legs','core','cardio','other'].map(c=>({value:c,label:c}))}/></div>
            <div><div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>Input type</div>
              <Sel value={type} onChange={setType} options={[{value:'bilateral',label:'Bilateral'},{value:'unilateral',label:'Unilateral R/L'},{value:'unilateral_load',label:'Unilateral + load'},{value:'weighted_bw',label:'Weighted BW'},{value:'bodyweight',label:'Bodyweight'},{value:'duration',label:'Duration'},{value:'reps_only',label:'Reps only'}]}/></div>
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>Split</div>
            <Sel value={split} onChange={setSplit} options={[{value:'',label:'— None —'},...SPLITS.map(s=>({value:s.name,label:s.name}))]}/></div>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:'var(--color-text-secondary)',marginBottom:2}}>Notes</div><Inp value={notes} onChange={setNotes} placeholder="optional cues"/></div>
          <Btn primary onClick={save} disabled={!n.trim()}>Save exercise</Btn>
        </div>
      )}
      <div style={{marginBottom:8}}><Inp value={search} onChange={setSearch} placeholder="Search exercises…"/></div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
        {['all','chest','back','shoulders','biceps','triceps','legs','core','cardio'].map(c=>(
          <span key={c} onClick={()=>setFilter(c)} style={{fontSize:10,padding:'4px 9px',borderRadius:20,cursor:'pointer',fontWeight:filter===c?500:400,
            background:filter===c?(CAT_BG[c]||'#F1EFE8'):'var(--color-background-secondary)',
            color:filter===c?(CAT_COLOR[c]||'#5F5E5A'):'var(--color-text-secondary)'}}>
            {c}
          </span>
        ))}
      </div>
      {filtered.map(e=>(
        <div key={e.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-md)',marginBottom:4}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:CAT_COLOR[e.cat]||'#888',flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500}}>{e.name}</div>
            <div style={{fontSize:10,color:'var(--color-text-secondary)'}}>{e.split||'—'} · {e.type}</div>
          </div>
          <Pill label={e.cat} color={CAT_COLOR[e.cat]} bg={CAT_BG[e.cat]}/>
          {e.custom&&<Pill label="custom" color="#533AB7" bg="#EEEDFE"/>}
        </div>
      ))}
    </div>
  );
}

// ─── ANALYTICS TAB ───────────────────────────────────────────────────────────
function AnalyticsTab({sessions,exLib}){
  const [selEx,setSelEx]=useState('bench_press');
  const [metric,setMetric]=useState('reps');
  const [selUni,setSelUni]=useState('bicep_curl');

  const ex=exLib.find(e=>e.id===selEx);
  const pts=getTopSets(sessions,selEx);
  const maxVal=pts.length?Math.max(...pts.map(p=>metric==='load'?(p.load||0):p.reps)):1;

  const uniPts=useMemo(()=>{
    const pts=[];
    sessions.forEach(s=>{
      const block=s.exercises?.find(e=>e.exId===selUni);
      if(!block) return;
      const uni=block.sets.filter(x=>x.r!==undefined&&x.l!==undefined);
      if(!uni.length) return;
      const r=Math.max(...uni.map(x=>x.r||0));
      const l=Math.max(...uni.map(x=>x.l||0));
      pts.push({date:s.date,r,l});
    });
    return pts.sort((a,b)=>a.date>b.date?1:-1);
  },[sessions,selUni]);
  const uniMax=uniPts.length?Math.max(...uniPts.flatMap(p=>[p.r,p.l])):1;

  const bilEx=exLib.filter(e=>e.type==='bilateral'||e.type==='weighted_bw');
  const uniEx=exLib.filter(e=>e.type==='unilateral'||e.type==='unilateral_load');

  // Cardio summary
  const cardioSessions=sessions.filter(s=>s.cardio?.logged).slice(-10);

  return(
    <div>
      <div style={{fontWeight:500,fontSize:15,marginBottom:14}}>Analytics</div>

      {/* Top set progression */}
      <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'12px 14px',marginBottom:14}}>
        <div style={{fontWeight:500,fontSize:13,marginBottom:10}}>Top set progression</div>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <div style={{flex:2}}><Sel value={selEx} onChange={setSelEx} options={bilEx.map(e=>({value:e.id,label:e.name}))}/></div>
          <div style={{flex:1}}><Sel value={metric} onChange={setMetric} options={[{value:'reps',label:'Reps'},{value:'load',label:'Load'}]}/></div>
        </div>
        {pts.length===0&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',fontSize:12,padding:'16px 0'}}>No working sets for this exercise.</div>}
        {pts.length>0&&(
          <div style={{display:'flex',alignItems:'flex-end',gap:3,height:110,overflowX:'auto',paddingBottom:20}}>
            {pts.map((p,i)=>{
              const val=metric==='load'?(p.load||0):p.reps;
              const h=maxVal>0?Math.max(4,Math.round((val/maxVal)*88)):4;
              const isLast=i===pts.length-1;
              return(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,minWidth:30,flex:1}}>
                  <div style={{fontSize:9,fontWeight:isLast?500:400,color:'var(--color-text-secondary)'}}>{val}</div>
                  <div style={{width:'100%',maxWidth:28,height:h,background:isLast?(CAT_COLOR[ex?.cat]||'#378ADD'):'var(--color-background-secondary)',borderRadius:'2px 2px 0 0'}}/>
                  <div style={{fontSize:8,color:'var(--color-text-tertiary)',transform:'rotate(-35deg)',transformOrigin:'top center',whiteSpace:'nowrap',marginTop:2}}>{p.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* R vs L */}
      <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'12px 14px',marginBottom:14}}>
        <div style={{fontWeight:500,fontSize:13,marginBottom:10}}>Unilateral R vs L</div>
        <div style={{marginBottom:10}}><Sel value={selUni} onChange={setSelUni} options={uniEx.map(e=>({value:e.id,label:e.name}))}/></div>
        {uniPts.length===0&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',fontSize:12,padding:'16px 0'}}>No unilateral data.</div>}
        {uniPts.length>0&&(
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:90,overflowX:'auto',paddingBottom:20}}>
            {uniPts.map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-end',gap:1,minWidth:28,flex:1}}>
                <div style={{display:'flex',gap:1,alignItems:'flex-end',width:'100%'}}>
                  <div title={`R ${p.r}`} style={{flex:1,height:Math.max(3,Math.round((p.r/uniMax)*72)),background:'#378ADD',borderRadius:'2px 2px 0 0'}}/>
                  <div title={`L ${p.l}`} style={{flex:1,height:Math.max(3,Math.round((p.l/uniMax)*72)),background:'#D85A30',borderRadius:'2px 2px 0 0'}}/>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',gap:12,fontSize:11,color:'var(--color-text-secondary)'}}>
          <span><span style={{display:'inline-block',width:8,height:8,borderRadius:1,background:'#378ADD',marginRight:3}}/> Right</span>
          <span><span style={{display:'inline-block',width:8,height:8,borderRadius:1,background:'#D85A30',marginRight:3}}/> Left</span>
        </div>
      </div>

      {/* Cardio log summary */}
      {cardioSessions.length>0&&(
        <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'12px 14px'}}>
          <div style={{fontWeight:500,fontSize:13,marginBottom:8}}>Recent cardio</div>
          {cardioSessions.map(s=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:12,borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
              <span style={{color:'var(--color-text-secondary)',minWidth:70}}>{fmtDate(s.date)}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:500}}>{s.cardio.dur}min</span>
              {s.cardio.incline&&<span style={{color:'var(--color-text-secondary)'}}>↑{s.cardio.incline}%</span>}
              {s.cardio.speed&&<span style={{color:'var(--color-text-secondary)'}}>{s.cardio.speed}km/h</span>}
              {s.cardio.note&&<span style={{color:'var(--color-text-tertiary)',fontStyle:'italic',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.cardio.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({sessions,nutLog,foodLib,setTab}){
  const today=todayStr();
  const macros=computeMacros(nutLog[today]||[],foodLib);
  const recent=[...sessions].sort((a,b)=>b.date>a.date?1:-1).slice(0,3);
  const sessionDays=new Set(sessions.map(s=>s.date));
  let streak=0;
  for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().split('T')[0];if(sessionDays.has(k))streak++;else break;}

  const cardioMissed=sessions.filter(s=>s.date>=new Date(Date.now()-7*864e5).toISOString().split('T')[0]&&!s.cardio?.logged).length;

  return(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:'var(--color-text-secondary)',marginBottom:2}}>Recomp Strength Phase</div>
        <div style={{fontSize:20,fontWeight:500}}>{fmtDate(today)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
        {[[sessions.length,'total sessions'],[streak,'day streak'],[cardioMissed?`${cardioMissed} missed`:'all done','cardio (7d)']].map(([v,l])=>(
          <div key={l} style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'10px 12px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:500,color:l.includes('missed')&&v?'#A32D2D':'var(--color-text-primary)'}}>{v}</div>
            <div style={{fontSize:10,color:'var(--color-text-secondary)'}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'12px 14px',marginBottom:14}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:8,color:'var(--color-text-secondary)'}}>Today's nutrition</div>
        <MacroBar label="Calories" val={macros.cal} target={CAL_TARGET} color="#378ADD"/>
        <MacroBar label="Protein" val={macros.prot} target={PROT_TARGET} color="#1D9E75"/>
      </div>

      {/* Weekly plan */}
      <div style={{background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)',padding:'10px 12px',marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:500,color:'var(--color-text-tertiary)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>New weekly split</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,fontSize:10,textAlign:'center'}}>
          {[['Mon','Push A/B'],['Tue','Pull A/B'],['Wed','Abs'],['Thu','Shoulders'],['Fri','Legs'],['Sat','Rest/Swim']].map(([d,n])=>(
            <div key={d}><div style={{color:'var(--color-text-tertiary)',marginBottom:1}}>{d}</div><div style={{fontWeight:500,fontSize:9,color:'var(--color-text-secondary)'}}>{n}</div></div>
          ))}
        </div>
      </div>

      <div style={{fontWeight:500,fontSize:13,marginBottom:8}}>Recent sessions</div>
      {recent.map(s=>{
        const cats=[...new Set((s.exercises||[]).map(e=>{const ex=EX_INIT.find(x=>x.id===e.exId);return ex?.cat;}).filter(Boolean))];
        return(
          <div key={s.id} style={{padding:'9px 12px',background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-md)',marginBottom:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:500,fontSize:13}}>{s.name}</div>
                <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>{fmtDate(s.date)}</div>
              </div>
              <div style={{display:'flex',gap:3}}>{cats.slice(0,2).map(c=><Pill key={c} label={c} color={CAT_COLOR[c]} bg={CAT_BG[c]}/>)}</div>
            </div>
          </div>
        );
      })}
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <Btn primary onClick={()=>setTab('workout')}>Log workout</Btn>
        <Btn onClick={()=>setTab('nutrition')}>Log food</Btn>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState('dashboard');
  const [exLib,setExLib]=useState(EX_INIT);
  const [sessions,setSessions]=useState(HIST_INIT);
  const [foodLib,setFoodLib]=useState(FOODS_INIT);
  const [mealTemplates]=useState(MEAL_TEMPLATES_INIT);
  const [nutLog,setNutLog]=useState({});
  const [selDate,setSelDate]=useState(todayStr());
  const [activeSession,setActiveSession]=useState(null);
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    (async()=>{
      const [storedSess,storedFoods,storedLog,storedEx]=await Promise.all([
        loadStore('sessions',null),loadStore('foodLib',null),loadStore('nutLog',{}),loadStore('exercises',null),
      ]);
      if(storedSess)setSessions(storedSess);
      if(storedFoods)setFoodLib(storedFoods);
      if(storedLog)setNutLog(storedLog);
      if(storedEx)setExLib(storedEx);
      setLoaded(true);
    })();
  },[]);

  const TABS=[['dashboard','⊡','Home'],['workout','◈','Workout'],['nutrition','◆','Nutrition'],['library','≡','Library'],['analytics','↗','Stats']];

  return(
    <div style={{fontFamily:'var(--font-sans)',color:'var(--color-text-primary)',minHeight:'100vh',display:'flex',flexDirection:'column',maxWidth:640,margin:'0 auto'}}>
      <div style={{padding:'12px 16px 0',borderBottom:'0.5px solid var(--color-border-tertiary)',display:'flex',alignItems:'center'}}>
        <div style={{flex:1,fontSize:11,color:'var(--color-text-tertiary)',letterSpacing:'.06em',textTransform:'uppercase'}}>RSP — Training Journal</div>
        {activeSession&&<Pill label="● SESSION ACTIVE" color="#0C447C" bg="#E6F1FB"/>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px',paddingBottom:72}}>
        {!loaded?<div style={{textAlign:'center',padding:40,color:'var(--color-text-secondary)'}}>Loading…</div>:(
          <>
            {tab==='dashboard'&&<Dashboard sessions={sessions} nutLog={nutLog} foodLib={foodLib} setTab={setTab}/>}
            {tab==='workout'&&<WorkoutTab sessions={sessions} setSessions={setSessions} exLib={exLib} activeSession={activeSession} setActiveSession={setActiveSession}/>}
            {tab==='nutrition'&&<NutritionTab foodLib={foodLib} setFoodLib={setFoodLib} mealTemplates={mealTemplates} nutLog={nutLog} setNutLog={setNutLog} selDate={selDate} setSelDate={setSelDate}/>}
            {tab==='library'&&<LibraryTab exLib={exLib} setExLib={setExLib}/>}
            {tab==='analytics'&&<AnalyticsTab sessions={sessions} exLib={exLib}/>}
          </>
        )}
      </div>
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:640,background:'var(--color-background-primary)',borderTop:'0.5px solid var(--color-border-tertiary)',display:'flex',zIndex:100}}>
        {TABS.map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'7px 0 10px',border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:1,
            color:tab===id?'var(--color-text-primary)':'var(--color-text-tertiary)'}}>
            <span style={{fontSize:15}}>{icon}</span>
            <span style={{fontSize:9,fontWeight:tab===id?500:400}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
